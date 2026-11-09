import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBKHYBgeKbOJDUxj4hrLFfIMcxTP9HjHGI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "therapy-1e39d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "therapy-1e39d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "therapy-1e39d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "850829356679",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:850829356679:web:3f2ff0031aa17a254ed222",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-80XXL0T18X",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://therapy-1e39d-default-rtdb.firebaseio.com"
};

// Initialize or reuse app
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Authentication with local persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Could not set auth persistence:", err);
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Realtime Database
export const db = getDatabase(app, firebaseConfig.databaseURL);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Safe Analytics initialization
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Analytics initialization failed:", e);
      }
    }
  }).catch(() => {
    // Ignore analytics error in unsupported environments
  });
}

export default app;
