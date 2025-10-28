import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Import getDoc
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Google Icon SVG (unchanged)
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.06 6.21C12.06 13.52 17.53 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.6 28.71c-.48-1.45-.76-2.99-.76-4.6s.27-3.14.76-4.6l-8.06-6.21C.96 16.07 0 20.01 0 24s.96 7.93 2.56 11.11l8.04-6.4z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.47 0-11.94-4.02-13.9-9.42l-8.06 6.21C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in (runs only once on mount)
  useEffect(() => {
    if (user) {
      navigate('/profile', { replace: true });
    }
  }, [user, navigate]);

  // Create user profile if it doesn't exist
  const ensureUserProfile = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      // Only create if it truly doesn't exist
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName, // Store display name too
        photoURL: firebaseUser.photoURL,     // Store photo URL
        favorites: [] // Initialize an empty favorites array
      });
      console.log("Created user profile for:", firebaseUser.email);
    } else {
       // Optionally update displayName/photoURL if they logged in via Google again
       await setDoc(userRef, {
           displayName: firebaseUser.displayName,
           photoURL: firebaseUser.photoURL
       }, { merge: true }); // Merge updates existing doc
       console.log("User profile already exists for:", firebaseUser.email);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Ensure profile exists after signup
        await ensureUserProfile(userCredential.user);
      }
      navigate('/profile', { replace: true }); // Use replace to prevent back button going to login
    } catch (err) {
      setError(err.message.replace('Firebase: ', '')); // Cleaner error message
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError(null); // Clear previous errors
    try {
      const result = await signInWithPopup(auth, provider);
      // Ensure profile exists after Google sign in
      await ensureUserProfile(result.user);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  // Prevent rendering login form briefly if already logged in
  if (user) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-50 p-6">
       {/* Back Button */}
       <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto p-8 space-y-6 bg-white shadow-xl rounded-2xl border border-gray-100"
      >
        <h1 className="text-3xl font-bold text-center text-gray-900">
          {isLogin ? 'Welcome Back!' : 'Create your Account'}
        </h1>

        <AnimatePresence>
            {error && (
            <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
            >
                <AlertCircle size={16} />
                {error}
            </motion.p>
            )}
        </AnimatePresence>


        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email address"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              aria-label="Email address"
            />
          </div>
          {/* Password Input */}
          <div className="relative">
             <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              aria-label="Password"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-black text-white font-semibold rounded-lg shadow hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Login' : 'Sign Up')}
          </motion.button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
        >
          <GoogleIcon />
          Google
        </motion.button>

        <p className="text-sm text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }} // Clear error on toggle
            className="font-semibold text-black hover:underline ml-1"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
