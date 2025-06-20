"use client";

import { useSession } from "next-auth/react";
import { signInToFirebaseWithIdToken } from "@/lib/firebaseSignIn";
import { useEffect, useRef } from "react";

// Helper to force NextAuth session refresh
async function refreshSession() {
  // This will call the NextAuth session endpoint with 'update' trigger
  await fetch("/api/auth/session?update", { method: "POST" });
}

// Extend the Session type to include idToken
interface SessionWithIdToken {
  idToken?: string;
  [key: string]: unknown;
}

export function useSyncFirebaseAuth() {
  const { data: session, update } = useSession();
  const s = session as unknown as SessionWithIdToken;
  const lastTokenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    async function sync() {
      if (!s?.idToken) {
        // Try to refresh session if no idToken
        if (typeof update === "function") await update();
        await refreshSession();
        return;
      }
      if (s.idToken !== lastTokenRef.current) {
        lastTokenRef.current = s.idToken;
        signInToFirebaseWithIdToken(s.idToken);
      }
    }
    sync();
  }, [s?.idToken, update]);
}
