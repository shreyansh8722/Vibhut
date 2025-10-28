import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Github, User } from "lucide-react";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPromptModal({ open, onClose }) {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose(); // Close modal after successful login
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-[380px] p-6 text-center relative overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-semibold text-gray-900 mb-2"
            >
              Sign in to CitySaathi
            </motion.h2>
            <p className="text-gray-600 text-sm mb-6">
              Join our community to save favorites and explore personalized recommendations.
            </p>

            {/* Google Sign-In */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleGoogleLogin}
              className="w-full bg-black text-white rounded-full py-3 font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:bg-gray-900"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </motion.button>

            {/* Placeholder Buttons */}
            <div className="mt-3 space-y-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled
                className="w-full bg-gray-100 text-gray-500 rounded-full py-3 font-medium text-sm flex items-center justify-center gap-2"
              >
                <Mail size={16} /> Continue with Email (coming soon)
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled
                className="w-full bg-gray-100 text-gray-500 rounded-full py-3 font-medium text-sm flex items-center justify-center gap-2"
              >
                <Github size={16} /> Continue with GitHub (coming soon)
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled
                className="w-full bg-gray-100 text-gray-500 rounded-full py-3 font-medium text-sm flex items-center justify-center gap-2"
              >
                <User size={16} /> Continue with Apple (coming soon)
              </motion.button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-xs text-gray-400">
              By continuing, you agree to CitySaathi’s{" "}
              <span className="underline cursor-pointer text-gray-500">Terms</span> &{" "}
              <span className="underline cursor-pointer text-gray-500">Privacy Policy</span>.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
