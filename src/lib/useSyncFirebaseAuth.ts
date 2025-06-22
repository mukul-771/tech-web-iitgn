"use client";

import { useSession } from "next-auth/react";
import { signInToFirebaseWithIdToken } from "@/lib/firebaseSignIn";
import { useEffect, useState, useRef, useCallback } from "react";
import { auth as firebaseAuth } from "@/lib/firebase-config";
import { onAuthStateChanged, User, getIdToken } from "firebase/auth";
import { signOut } from "firebase/auth";

// Time constants (in milliseconds)
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const BACKOFF_RESET_TIME = 5 * 60 * 1000; // 5 minutes
const SESSION_UPDATE_DELAY = 800; // 800ms delay between session updates

// Extend the Session type to include idToken
interface SessionWithIdToken {
  idToken?: string;
  expires?: string;
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
  const updateInProgressRef = useRef(false);
  
  // Get a fresh Firebase token 
  const refreshFirebaseToken = useCallback(async () => {
    if (!firebaseUser) return;
    
    try {
      console.log("Refreshing Firebase token");
      const newToken = await getIdToken(firebaseUser, true); // Force refresh
      console.log("Got fresh Firebase token");
      return newToken;
    } catch (error) {
      console.error("Failed to refresh Firebase token:", error);
      
      // If token refresh fails, try re-signing in with the NextAuth token
      if (s?.idToken && s.idToken !== lastTokenRef.current) {
        try {
          console.log("Trying to re-authenticate with NextAuth token");
          await signInToFirebaseWithIdToken(s.idToken);
        } catch (signInError) {
          console.error("Re-authentication failed:", signInError);
          if (!updateInProgressRef.current) {
            updateInProgressRef.current = true;
            await update();
            updateInProgressRef.current = false;
          }
        }
      }
      return null;
    }
  }, [firebaseUser, s?.idToken, update]);
  
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
      
      // Set up interval for token refresh
      intervalRef.current = setInterval(refreshFirebaseToken, TOKEN_REFRESH_INTERVAL);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [firebaseUser, refreshFirebaseToken]);

  // Force sign out and sign in when the session token changes
  useEffect(() => {
    async function syncAuth() {
      // Skip if no session or no token
      if (!s?.idToken) {
        return;
      }

      // If the token has changed or we're not authenticated, try to sign in
      if (s.idToken !== lastTokenRef.current || !isFirebaseAuthenticated) {
        try {
          console.log("Trying to sign in to Firebase with session token");
          lastTokenRef.current = s.idToken;
          
          // Always sign out first to ensure a clean state
          if (firebaseAuth?.currentUser) {
            await signOut(firebaseAuth);
          }
          
          // Sign in with the new token
          await signInToFirebaseWithIdToken(s.idToken);
        } catch (error: unknown) {
          console.error("Failed to authenticate with Firebase:", error instanceof Error ? error.message : String(error));
          
          const errorMessage = String(error);
          const isStaleTokenError = errorMessage.includes("stale") || 
                                  errorMessage.includes("expired") || 
                                  errorMessage.includes("invalid-credential");
          
          // If token is stale, try to get a new one
          if (isStaleTokenError && attemptRef.current < 3) {
            console.log("Token is stale, refreshing session to get new token, attempt:", attemptRef.current + 1);
            attemptRef.current += 1;
            
            // Reset attempt counter after some time
            setTimeout(() => {
              attemptRef.current = 0;
            }, BACKOFF_RESET_TIME);
            
            // Prevent multiple rapid session updates
            if (!updateInProgressRef.current) {
              updateInProgressRef.current = true;
              
              // Add a small delay to avoid race conditions
              setTimeout(async () => {
                await update();
                updateInProgressRef.current = false;
              }, SESSION_UPDATE_DELAY);
            }
          }
        }
      }
    }
    
    syncAuth();
  }, [s?.idToken, update, isFirebaseAuthenticated]);
  
  return { isFirebaseAuthenticated, firebaseUser };
}
