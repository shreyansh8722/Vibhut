import React, { useState } from 'react';
import { Sparkles, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RashiFloatingWidget = ({ onOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-2 p-2">
      
      {/* The Popup Bubble */}
      <AnimatePresence>
        {(isHovered) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white shadow-xl border border-gray-100 rounded-l-xl p-4 w-64 mb-2 relative"
          >
            <button 
               onClick={() => setIsDismissed(true)} 
               className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
            >
               <X size={12} />
            </button>
            <h4 className="font-heading font-bold text-[#1a3c34] text-sm mb-1">Confused what to buy?</h4>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
               Get personalized recommendations based on your Rashi (Zodiac) for maximum benefit.
            </p>
            <button 
               onClick={onOpen}
               className="w-full bg-[#B08D55] text-white text-xs font-bold uppercase py-2 rounded hover:bg-[#967645] transition-colors"
            >
               Check Recommendation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Trigger Button (Always Visible) */}
      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onClick={onOpen}
        whileHover={{ scale: 1.05 }}
        className="bg-[#1a3c34] text-white p-3 rounded-l-lg shadow-lg flex flex-col items-center gap-1 group border-r-4 border-[#B08D55]"
      >
        <Sparkles size={20} className="text-[#B08D55] animate-pulse" />
        <span className="writing-vertical-rl text-[10px] font-bold uppercase tracking-widest h-24 flex items-center">
           Shop By Rashi
        </span>
      </motion.button>
    </div>
  );
};

export default RashiFloatingWidget;