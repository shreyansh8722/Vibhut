import React from 'react';
import { createPortal } from 'react-dom'; // IMPORT PORTAL
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FilterModal = ({
  open,
  onClose,
  currentFilter,
  onFilterSelect,
  filterOptions = [],
}) => {
  if (!open) return null;

  // USE PORTAL TO RENDER AT ROOT LEVEL
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center pointer-events-none">
          
          {/* 1. Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          
          {/* 2. The Modal */}
          <motion.div
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full md:w-[400px] bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[85vh] flex flex-col pb-safe"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#FFFCF7]">
              <div>
                <h2 className="text-lg font-serif font-bold text-gray-900">Filter Collection</h2>
                <p className="text-xs text-gray-500">Select a category</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Options List */}
            <div className="p-2 overflow-y-auto">
              <div className="flex flex-col">
                {filterOptions.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onFilterSelect(f.id);
                      onClose();
                    }}
                    className={`px-5 py-4 text-sm font-medium transition-all flex justify-between items-center border-b border-gray-50 last:border-0 ${
                      currentFilter === f.id
                        ? 'text-[#B08D55] bg-[#B08D55]/5'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {f.name}
                    {currentFilter === f.id && <Check size={16} className="text-[#B08D55]" />}
                  </button>
                ))}
              </div>
            </div>
              
            {/* Footer Actions */}
            <div className="p-5 border-t border-gray-100 bg-white flex gap-3">
              <button 
                onClick={() => { onFilterSelect('All'); onClose(); }}
                className="flex-1 border border-gray-200 py-3 rounded-sm text-xs font-bold text-gray-600 uppercase tracking-widest hover:bg-gray-50"
              >
                Reset
              </button>
              <button 
                onClick={onClose}
                className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-black shadow-lg"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body // RENDER IN BODY
  );
};