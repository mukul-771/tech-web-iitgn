import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAdminEmails } from "./admin-emails-storage";
import { auth as adminAuth } from "./firebase-admin";

// Get admin emails dynamically from storage
async function getAuthorizedEmails(): Promise<string[]> {
  try {
    const adminEmails = await getAdminEmails();
    return adminEmails.emails;
  } catch (error) {
    console.error("Error loading admin emails, using fallback:", error);
    // Fallback to hardcoded emails if storage fails
    return [
      "mukul.meena@iitgn.ac.in",
      "technical.secretary@iitgn.ac.in",
    ];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          return null;
        }

        try {
          const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
          const { email, name, picture } = decodedToken;

          if (!email) {
            return null;
          }

          const authorizedEmails = await getAuthorizedEmails();
          if (!authorizedEmails.includes(email)) {
            return null;
          }

          return {
            id: decodedToken.uid,
            email,
            name,
            image: picture,
            isAdmin: true,
          };
        } catch (error) {
          console.error("Firebase token verification failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/error",
  },
  session: {
    strategy: "jwt",
  },
};

// Type augmentation for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    isAdmin?: boolean;
  }
}
