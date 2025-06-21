"use client";

import { useSession } from "next-auth/react";
import { signInToFirebaseWithIdToken } from "@/lib/firebaseSignIn";
import { useEffect, useRef } from "react";

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
      if (!s?.idToken && typeof update === "function") {
        await update();
        return;
      }
      if (s?.idToken && s.idToken !== lastTokenRef.current) {
        lastTokenRef.current = s.idToken;
        signInToFirebaseWithIdToken(s.idToken);
      }
    }
    sync();
  }, [s?.idToken, update]);
}
