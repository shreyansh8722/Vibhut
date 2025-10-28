// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDQ8Yki1FPLtul_n4kcRrzfNiZqUbdqIHo",
  authDomain: "city-saathi-app.firebaseapp.com",
  projectId: "city-saathi-app",
  storageBucket: "city-saathi-app.firebasestorage.app",
  messagingSenderId: "548418962777",
  appId: "1:548418962777:web:1daf54cf9b4175b46eb848",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
