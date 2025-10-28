// src/lib/firebaseLazy.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

let appInstance = null;
let dbInstance = null;
let authInstance = null;

export async function getFirebase() {
  if (appInstance && dbInstance && authInstance)
    return { app: appInstance, db: dbInstance, auth: authInstance };

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  appInstance = initializeApp(firebaseConfig);
  dbInstance = getFirestore(appInstance);
  authInstance = getAuth(appInstance);

  try {
    await enableIndexedDbPersistence(dbInstance);
  } catch (err) {
    console.warn("Persistence issue:", err.code);
  }

  return { app: appInstance, db: dbInstance, auth: authInstance };
}
