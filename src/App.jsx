// src/App.jsx
import React, { Suspense, lazy, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { LocationProvider } from "./hooks/useLocation";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "./components/LoadingSpinner"; // Ensure this path is correct
import { Home, Compass, Heart, User } from "lucide-react";
import { useAuth } from "./hooks/useAuth";


export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // ✅ ERROR FIX: Safely access user from useAuth hook
  // Provide a default empty object {} if useAuth() returns null/undefined initially
  const { user } = useAuth() || {};
  const [hideNav, setHideNav] = useState(false);

  // Scroll effect to hide/show nav
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const cur = window.scrollY;
      const shouldHide = cur > last && cur > 80 && document.body.scrollHeight > window.innerHeight + 100;
      setHideNav(shouldHide);
      last = cur;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentPath = location.pathname;

  // List of paths where the bottom nav should be visible
  const showNavPaths = ['/', '/explore', '/favorites', '/profile'];
  const shouldShowNav = showNavPaths.includes(currentPath);

  return (
    <AuthProvider>
      <LocationProvider>
        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            // Add bottom padding *only if* nav is shown
            className={`min-h-screen bg-white ${shouldShowNav ? 'pb-28' : ''}`}
          >
                 <Outlet />
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation */}
        {/* Conditionally render the nav based on the path */}
        {shouldShowNav && (
            <motion.nav
              initial={{ y: 100, opacity: 0 }}
              // Animate based on hideNav state AND shouldShowNav
              animate={{ y: hideNav ? 100 : 0, opacity: hideNav ? 0 : 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[350px] bg-[#0f0f0f] text-white rounded-full flex justify-around items-center px-4 py-3 shadow-2xl backdrop-blur-md z-50"
            >
              {/* Home */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/")}
                className={`p-2 rounded-full ${currentPath === '/' ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                aria-label="Home"
              >
                <Home size={22} />
              </motion.button>
              {/* Explore */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/explore")}
                className={`p-2 rounded-full ${currentPath === '/explore' ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                aria-label="Explore"
              >
                <Compass size={22} />
              </motion.button>
              {/* Favorites */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/favorites")}
                className={`p-2 rounded-full ${currentPath === '/favorites' ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                aria-label="Favorites"
              >
                <Heart size={22} />
              </motion.button>
              {/* Profile */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/profile")}
                className={`p-2 rounded-full ${currentPath === '/profile' ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                aria-label="Profile"
              >
                {user?.photoURL ? ( // Check if user exists before accessing photoURL
                    <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover"/>
                ) : (
                    <User size={22} />
                )}
              </motion.button>
            </motion.nav>
        )}
      </LocationProvider>
    </AuthProvider>
  );
}

