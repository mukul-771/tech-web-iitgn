import { signInWithCredential, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase-config";

export async function signInToFirebaseWithIdToken(idToken: string) {
  if (!firebaseAuth) {
    console.error("Firebase Auth not initialized");
    throw new Error("Firebase Auth not initialized");
  }
  
  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    throw new Error("Invalid ID token provided");
  }
  
  // Create a credential with the token
  const credential = GoogleAuthProvider.credential(idToken);
  
  try {
    // First sign out to clear any previous session
    if (firebaseAuth.currentUser) {
      console.log("Signing out current user before re-authentication");
      await signOut(firebaseAuth);
    }
    
    // Sign in with the fresh token
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    console.log("Firebase signInWithCredential success, user:", userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase signInWithCredential error", error);
    
    // If we get a specific stale token error, throw a more specific error
    const errorMessage = String(error);
    if (errorMessage.includes("stale") || errorMessage.includes("expired") || errorMessage.includes("invalid-credential")) {
      throw new Error("Token is stale or expired. Please refresh your session.");
    }
    
    throw error;
  }
}
