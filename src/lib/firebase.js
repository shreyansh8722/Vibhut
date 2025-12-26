// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
apiKey: "AIzaSyD8qcZZZD_iXZNnFcaQ5auErE9G-pU-Tio",
  authDomain: "vishwanatham-739fe.firebaseapp.com",
  projectId: "vishwanatham-739fe",
  storageBucket: "vishwanatham-739fe.firebasestorage.app",
  messagingSenderId: "160874328164",
  appId: "1:160874328164:web:b55befa71d43a5b5896f71",
  measurementId: "G-YJZZGVCSFX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
