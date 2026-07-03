import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Fallback configuration allows app to run in development even if env keys aren't populated yet
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "beautify-r.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "beautify-r",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "beautify-r.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id"
};

// Check if we are running with mock keys
export const isMockFirebase = firebaseConfig.apiKey === "mock-api-key";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
