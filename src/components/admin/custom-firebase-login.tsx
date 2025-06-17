"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { auth } from "@/lib/firebase-config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function CustomFirebaseLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    if (!auth) {
      setError("Firebase is not configured. Please check your environment variables.");
      setIsLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await signIn("credentials", {
        idToken,
        callbackUrl: "/admin",
      });

      if (res?.error) {
        setError("Failed to sign in. You may not be an authorized admin.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError("An error occurred during sign-in.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          "Sign in with Google"
        )}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}