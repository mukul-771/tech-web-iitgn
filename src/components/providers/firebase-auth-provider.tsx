"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase-config";
import { User, onAuthStateChanged, signOut } from "firebase/auth";

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function useFirebaseAuth() {
  return useContext(FirebaseAuthContext);
}

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.log("Firebase Auth not initialized, skipping authentication");
      setLoading(false);
      return;
    }

    console.log("Setting up Firebase Auth state listener");
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log("Firebase Auth state changed:", user ? `User: ${user.email}` : "No user");
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase Auth state change error:", error);
        setLoading(false);
      }
    );

    return () => {
      console.log("Cleaning up Firebase Auth listener");
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (auth && user) {
      try {
        await signOut(auth);
        console.log("Firebase logout successful");
      } catch (error) {
        console.error("Firebase logout error:", error);
      }
    }
  };

  return (
    <FirebaseAuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}
