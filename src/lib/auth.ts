import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getAdminEmails } from "./admin-emails-storage";

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const authorizedEmails = await getAuthorizedEmails();
        if (authorizedEmails.includes(user.email ?? "")) {
          user.isAdmin = true;
          return true;
        }
        return false;
      }
      return false;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id;
        token.isAdmin = user.isAdmin;
      }
      if (account?.provider === "google" && account.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.isAdmin = token.isAdmin;
      }
      if (typeof token.idToken === 'string') {
        session.idToken = token.idToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
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

// Extend NextAuth Session type to include idToken
import NextAuth from "next-auth";
declare module "next-auth" {
  interface Session {
    idToken?: string;
  }
}
