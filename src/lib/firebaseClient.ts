import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBlYhLqXEJJ6trgnZIOEvAKxMou7wigNjY",
  authDomain: "tech-website-prod.firebaseapp.com",
  projectId: "tech-website-prod",
  storageBucket: "tech-website-prod.firebasestorage.app", // <-- UPDATED for new bucket naming
  messagingSenderId: "578108451083",
  appId: "1:578108451083:web:dccd49220391a2a2bc1a0e"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// For debugging in browser console
if (typeof window !== "undefined") {
  (window as any).firebaseAuth = auth;
  (window as any).firebaseStorage = storage;
}
