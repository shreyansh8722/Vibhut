import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '../hooks/useAuth'; // Connects to your fixed hook

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  
  // 1. Get Auth Functions from the Hook
  const { login, signup, googleSignIn, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  // 4. Handle Email/Password Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      // Success? The useEffect above will handle the redirect
    } catch (err) {
      console.error(err);
      // Clean up Firebase error codes for display
      const msg = err.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : 'Failed to authenticate';
      setError(msg.charAt(0).toUpperCase() + msg.slice(1));
      setLoading(false);
    }
  };

  // 5. Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      // Success? The useEffect above will handle the redirect
    } catch (err) {
      console.error(err);
      setError('Google Sign-In Failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative font-body">
      
      {/* Background Decoration (Blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-[100px] opacity-50"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gray-200 rounded-full blur-[100px] opacity-50"></div>
      </div>

      {/* Skip Button */}
      <Link to="/" className="absolute top-6 right-6 text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest z-20">
        Skip <span className="hidden sm:inline">to Store</span>
      </Link>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl p-8 md:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <BrandLogo className="h-8 mx-auto text-[var(--color-primary)] mb-6" />
          <h1 className="font-heading text-3xl font-bold text-black mb-2">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Enter your credentials to access your account.' : 'Create an account to track your spiritual journey.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-xs font-bold text-red-600 animate-pulse">
             <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all mb-6 disabled:opacity-50"
        >
          <GoogleIcon />
          <span>{isLogin ? 'Sign in with Google' : 'Sign up with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center mb-6">
           <hr className="w-full border-gray-100" />
           <span className="absolute bg-white px-3 text-[10px] text-gray-400 uppercase tracking-widest font-bold">Or Continue With</span>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Signup Only) */}
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-medium placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-medium placeholder:text-gray-400"
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-medium placeholder:text-gray-400"
            />
          </div>

          {/* Signup Terms Checkbox */}
          {!isLogin && (
            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="terms" className="accent-black w-3.5 h-3.5" required />
              <label htmlFor="terms" className="text-[11px] text-gray-500 cursor-pointer">
                I agree to the <span className="underline font-bold text-gray-700">Terms</span> & <span className="underline font-bold text-gray-700">Privacy Policy</span>
              </label>
            </div>
          )}

          {/* Forgot Password Link (Login Only) */}
          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors">Forgot Password?</button>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-primary)] transition-colors shadow-lg flex items-center justify-center gap-2 mt-2 disabled:bg-gray-400"
          >
             {loading ? 'Processing...' : (isLogin ? 'Secure Login' : 'Create Account')} 
             {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-8 text-center pt-6 border-t border-gray-50">
           <p className="text-sm text-gray-500">
             {isLogin ? "New to Vishwanatham?" : "Already have an account?"}
             <button 
               onClick={() => { setIsLogin(!isLogin); setError(''); }}
               className="ml-2 font-bold text-black hover:text-[var(--color-primary)] transition-colors underline decoration-2 decoration-gray-100 hover:decoration-[var(--color-primary)]"
             >
               {isLogin ? "Create Account" : "Sign In"}
             </button>
           </p>
        </div>

      </motion.div>
    </div>
  );
};

export default LoginPage;