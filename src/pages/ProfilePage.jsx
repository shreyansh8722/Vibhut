import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import {
  LogOut,
  ChevronRight,
  Heart,
  Settings,
  ArrowLeft,
  User as UserIcon, // Renamed to avoid conflict
} from 'lucide-react';
import { motion } from 'framer-motion';

// A reusable component for profile navigation links
const ProfileLink = ({ icon, label, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.99, backgroundColor: "#f9f9f9" }}
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-5 bg-white border-b border-gray-100 text-left"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <span className="text-base font-medium text-gray-900">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </motion.button>
);

export default function ProfilePage() {
  const { user } = useAuth(); // Get the currently logged-in user
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to home page after logout
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  // This should be handled by ProtectedRoute, but it's a good safeguard
  if (!user) {
    return null; 
  }

  const firstName = (user.displayName?.split(" ")[0] || "User").replace(/[^A-Za-z]/g, "");

  return (
    <div className="min-h-screen bg-gray-50 pb-28"> {/* Added padding for bottom nav */}
      
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold">Profile</h1>
      </div>

      {/* User Info Section */}
      <div className="p-6 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                {/* Fallback icon if no photoURL */}
                <UserIcon size={32} className="text-gray-500" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.displayName || firstName}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mt-6">
        <ProfileLink
          icon={<Heart size={20} className="text-gray-600" />}
          label="My Favorites"
          onClick={() => navigate('/favorites')}
        />
        <ProfileLink
          icon={<Settings size={20} className="text-gray-600" />}
          label="Account Settings"
          onClick={() => {
            // You can build this page later
            console.log("Navigate to settings");
          }}
        />
      </div>

      {/* Logout Button */}
      <div className="mt-8 px-6">
        <motion.button
          whileTap={{ scale: 0.99, backgroundColor: "#f8f8f8" }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <LogOut size={18} className="text-red-500" />
          <span className="text-base font-medium text-red-500">Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
