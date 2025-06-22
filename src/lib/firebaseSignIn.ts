import { signInWithCredential, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase-config";

export async function signInToFirebaseWithIdToken(idToken: string) {
  if (!firebaseAuth) {
    console.error("Firebase Auth not initialized");
    throw new Error("Firebase Auth not initialized");
  }
  
  // Create a credential with the token
  const credential = GoogleAuthProvider.credential(idToken);
  
  try {
    // First sign out to clear any previous session
    if (firebaseAuth.currentUser) {
      await signOut(firebaseAuth);
    }
    
    // Sign in with the fresh token
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    console.log("Firebase signInWithCredential success, user:", userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase signInWithCredential error", error);
    throw error;
  }
}
