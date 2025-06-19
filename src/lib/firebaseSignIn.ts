import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth";

export async function signInToFirebaseWithIdToken(idToken: string) {
  const auth = getAuth();
  const credential = GoogleAuthProvider.credential(idToken);
  try {
    const user = await signInWithCredential(auth, credential);
    console.log("Firebase signInWithCredential success", user);
  } catch (error) {
    console.error("Firebase signInWithCredential error", error);
  }
}
