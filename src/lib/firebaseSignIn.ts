import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth";

export async function signInToFirebaseWithIdToken(idToken: string) {
  const auth = getAuth();
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}
