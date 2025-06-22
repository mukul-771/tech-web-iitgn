"use client";

import { useSession } from "next-auth/react";
import { signInToFirebaseWithIdToken } from "@/lib/firebaseSignIn";
import { useEffect, useState, useRef, useCallback } from "react";
import { auth as firebaseAuth } from "@/lib/firebase-config";
import { onAuthStateChanged, User, getIdToken } from "firebase/auth";

// Extend the Session type to include idToken
interface SessionWithIdToken {
  idToken?: string;
  user?: {
    email?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function useSyncFirebaseAuth() {
  const { data: session, update } = useSession();
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const s = session as unknown as SessionWithIdToken;
  const attemptRef = useRef(0);
  const lastTokenRef = useRef<string | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get a fresh Firebase token every 50 minutes (token expires after 60 minutes)
  const refreshFirebaseToken = useCallback(async () => {
    if (!firebaseUser) return;
    
    try {
      console.log("Refreshing Firebase token");
      await getIdToken(firebaseUser, true); // Force refresh
      console.log("Got fresh Firebase token");
    } catch (error) {
      console.error("Failed to refresh Firebase token:", error);
    }
  }, [firebaseUser]);
  
  // Listen for Firebase Auth state changes
  useEffect(() => {
    if (!firebaseAuth) {
      console.error("Firebase Auth not initialized");
      return;
    }
    
    console.log("Setting up Firebase Auth state change listener");
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        console.log("Firebase authenticated as:", user.email);
        setFirebaseUser(user);
        setIsFirebaseAuthenticated(true);
      } else {
        console.log("No Firebase user authenticated");
        setFirebaseUser(null);
        setIsFirebaseAuthenticated(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (firebaseUser && !intervalRef.current) {
      // Initial token refresh
      refreshFirebaseToken();
      
      // Set up interval (50 minutes) for token refresh
      intervalRef.current = setInterval(refreshFirebaseToken, 50 * 60 * 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [firebaseUser, refreshFirebaseToken]);

  // Handle NextAuth session changes
  useEffect(() => {
    async function syncAuth() {
      // Skip if no session or no token
      if (!s?.idToken) {
        return;
      }

      // Skip if using the same token we already tried
      if (s.idToken === lastTokenRef.current && isFirebaseAuthenticated) {
        return;
      }
      
      // Try to authenticate with Firebase using the token
      try {
        console.log("Trying to sign in to Firebase with session token");
        lastTokenRef.current = s.idToken;
        await signInToFirebaseWithIdToken(s.idToken);
      } catch (error: unknown) {
        console.error("Failed to authenticate with Firebase:", error instanceof Error ? error.message : String(error));
        
        // Only try to refresh the token if we haven't tried too many times
        if (attemptRef.current < 3) {
          console.log("Refreshing session to get new token, attempt:", attemptRef.current + 1);
          attemptRef.current += 1;
          // Reset attempt counter after 5 minutes
          setTimeout(() => {
            attemptRef.current = 0;
          }, 5 * 60 * 1000);
          await update();
        }
      }
    }
    
    syncAuth();
  }, [s?.idToken, update, isFirebaseAuthenticated]);
  
  return { isFirebaseAuthenticated, firebaseUser };
}
