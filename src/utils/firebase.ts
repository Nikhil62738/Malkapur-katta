import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration using environment variables with mock fallbacks for local dev
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyMockApiKeyForMalkapurKattaAdminPanel",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "malkapur-katta-official.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "malkapur-katta-official",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "malkapur-katta-official.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MOCKID1234"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize messaging with a safety check for server-side rendering or unsupported browsers
let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch((err) => {
  console.warn("Firebase messaging is not supported in this browser environment:", err);
});

export { app, auth, db, storage, messaging };
