import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase-config";

export async function signInToFirebaseWithIdToken(idToken: string) {
  if (!firebaseAuth) {
    console.error("Firebase Auth not initialized");
    return;
  }
  const credential = GoogleAuthProvider.credential(idToken);
  try {
    const user = await signInWithCredential(firebaseAuth, credential);
    console.log("Firebase signInWithCredential success", user);
  } catch (error) {
    console.error("Firebase signInWithCredential error", error);
  }
}
