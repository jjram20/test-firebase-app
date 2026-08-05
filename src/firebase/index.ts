import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099")
  connectFirestoreEmulator(firestore, "http://127.0.0.1", 8080)
  connectFunctionsEmulator(functions, "http://127.0.0.1", 5001)
  connectStorageEmulator(storage, "http://127.0.0.1", 9199)
}

export { analytics, app, auth, firestore, functions, storage }