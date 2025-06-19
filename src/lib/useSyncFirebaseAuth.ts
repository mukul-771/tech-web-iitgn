"use client";

import { useSession } from "next-auth/react";
import { signInToFirebaseWithIdToken } from "@/lib/firebaseSignIn";
import { useEffect } from "react";

// Extend the Session type to include idToken
interface SessionWithIdToken {
  idToken?: string;
  [key: string]: any;
}

export function useSyncFirebaseAuth() {
  const { data: session } = useSession();
  const s = session as SessionWithIdToken;
  useEffect(() => {
    if (s?.idToken) {
      signInToFirebaseWithIdToken(s.idToken);
    }
  }, [s]);
}
