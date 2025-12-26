import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StickyActionBar = ({ product, isOutOfStock, onAddToCart, mainButtonRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!mainButtonRef?.current) return;
      
      const buttonRect = mainButtonRef.current.getBoundingClientRect();
      // Show sticky bar only when the main button has scrolled UP out of view (top < 0)
      // AND we are not at the very top of the page (scrollY > 100)
      const isMainButtonHidden = buttonRect.bottom < 0; 
      
      setIsVisible(isMainButtonHidden);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mainButtonRef]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100 }} 
          animate={{ y: 0 }} 
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-[40] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-safe"
        >
          <div className="flex gap-4 items-center">
             <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-[#B08D55] font-bold">₹{Number(product.price).toLocaleString('en-IN')}</p>
             </div>
             
             <button 
                onClick={onAddToCart}
                disabled={isOutOfStock}
                className="bg-black text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
             >
                <ShoppingBag size={14} /> {isOutOfStock ? "Sold Out" : "Add to Bag"}
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};