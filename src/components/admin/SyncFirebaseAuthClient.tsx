"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SyncFirebaseAuthClient() {
  const { data: session } = useSession();
  
  useEffect(() => {
    // For now, just log the session status instead of trying to sync with Firebase
    // This prevents the authentication loop with stale tokens
    if (session?.user) {
      console.log("NextAuth session active for:", session.user.email);
    } else {
      console.log("No active NextAuth session");
    }
  }, [session]);
  
  return null;
}
