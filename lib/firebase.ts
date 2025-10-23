import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Env-driven config; ensure NEXT_PUBLIC_* are set in .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

function initFirebase(): FirebaseApp | null {
  // If required keys are missing, avoid initializing to prevent runtime errors in dev
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("Firebase env vars missing. Set NEXT_PUBLIC_FIREBASE_* in .env.local");
    }
    return null;
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const firebaseApp = initFirebase();
export const auth = firebaseApp ? getAuth(firebaseApp) : undefined;
export const db = firebaseApp ? getFirestore(firebaseApp) : undefined;
