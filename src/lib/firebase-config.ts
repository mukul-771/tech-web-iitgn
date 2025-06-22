// Firebase configuration for client-side operations
import { initializeApp, getApps, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, GoogleAuthProvider, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';

// Determine the environment we're running in
const isDevelopment = process.env.NODE_ENV === 'development';

// Check if Firebase is configured
const isFirebaseConfigured = (): boolean => {
  const hasRequiredVars = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
  
  const hasFakeVars = 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('placeholder') ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('your_') ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.includes('demo');
  
  return hasRequiredVars && !hasFakeVars;
};

// Build the Firebase configuration from environment variables
const getFirebaseConfig = (): FirebaseOptions => {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
};

// Initialize Firebase services with proper error handling and logging
class FirebaseService {
  private static instance: FirebaseService;
  public app: FirebaseApp | null = null;
  public storage: FirebaseStorage | null = null;
  public auth: Auth | null = null;
  public db: Firestore | null = null;
  public googleProvider: GoogleAuthProvider;
  
  private constructor() {
    this.googleProvider = new GoogleAuthProvider();
    
    if (isFirebaseConfigured()) {
      try {
        const apps = getApps();
        if (apps.length === 0) {
          const config = getFirebaseConfig();
          console.info('Initializing Firebase with project:', config.projectId);
          this.app = initializeApp(config);
        } else {
          this.app = apps[0];
        }
        
        if (this.app) {
          // Initialize Firestore
          this.db = getFirestore(this.app);
          
          // Initialize Storage
          this.storage = getStorage(this.app);
          
          // Initialize Auth
          this.auth = getAuth(this.app);
          this.auth.useDeviceLanguage();
          
          // Connect to emulators if in development and emulator URLs are provided
          if (isDevelopment) {
            this.connectToEmulators();
          }
        }
      } catch (error) {
        console.error('Firebase initialization failed:', error);
      }
    } else {
      console.warn('Firebase not properly configured. Using mock services or fallbacks.');
    }
  }
  
  private connectToEmulators() {
    try {
      // Connect to Firebase emulators if running locally with environment variables set
      const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
      
      if (useEmulators) {
        const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
        
        if (this.auth) {
          connectAuthEmulator(this.auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
          console.info('Connected to Firebase Auth emulator');
        }
        
        if (this.db) {
          connectFirestoreEmulator(this.db, emulatorHost, 8080);
          console.info('Connected to Firestore emulator');
        }
        
        if (this.storage) {
          connectStorageEmulator(this.storage, emulatorHost, 9199);
          console.info('Connected to Firebase Storage emulator');
        }
      }
    } catch (error) {
      console.error('Failed to connect to Firebase emulators:', error);
    }
  }
  
  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }
}

// Get singleton instance
const firebaseService = FirebaseService.getInstance();

// Export services
export const app = firebaseService.app;
export const storage = firebaseService.storage;
export const auth = firebaseService.auth;
export const db = firebaseService.db;
export const googleProvider = firebaseService.googleProvider;

export default app;