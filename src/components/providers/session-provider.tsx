"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { FirebaseAuthProvider } from "./firebase-auth-provider";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <FirebaseAuthProvider>
        {children}
      </FirebaseAuthProvider>
    </NextAuthSessionProvider>
  );
}
