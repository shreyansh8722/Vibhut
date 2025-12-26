import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,       // Added
  GoogleAuthProvider,    // Added
  updateProfile          // Added
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../lib/firebase.js"; // <--- FIXED PATH

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          // Fetch user role from Firestore
          const userDocRef = doc(db, "users", u.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          setUser({ ...u, role: userData.role || 'user' });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(u); // Fallback to basic auth user
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // 1. Email Login
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  // 2. Email Signup (With Name & Firestore)
  const signup = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update Profile Name
    await updateProfile(result.user, { displayName: name });

    // Create Firestore Doc
    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      email: email,
      displayName: name,
      role: 'user',
      createdAt: new Date()
    });
    
    return result;
  };

  // 3. Google Login
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check/Create Firestore Doc
    const userDocRef = doc(db, "users", result.user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        role: 'user',
        createdAt: new Date()
      });
    }
    return result;
  };

  // 4. Logout
  const logout = () => signOut(auth);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    googleSignIn
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}