import React, { useState, useEffect } from 'react';
// --- REMOVED motion, AnimatePresence ---
import { ArrowLeft } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useNavigate } from 'react-router-dom';

export const PageHeader = ({ title }) => {
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection(60);
  const isScrolled = scrollDirection === 'down' || scrollDirection === 'up';

  // --- NEW: Simple state for scroll ---
  const [scrolled, setScrolled] = useState(false);

  // --- NEW: Lightweight scroll listener ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 p-4">
      {/* Background blur (fades in on scroll with CSS) */}
      <div
        className={`absolute inset-0 bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 transition-opacity ${
          scrolled ? 'opacity-100' : 'opacity-0' // --- CSS transition ---
        }`}
      />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className={`z-10 w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          scrolled
            ? 'bg-white/80 text-gray-900 dark:bg-gray-900/80 dark:text-white'
            : 'bg-black/40 text-white backdrop-blur-md'
        }`}
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Page Title (appears on scroll with CSS) */}
      <h1
        className={`absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-900 dark:text-white transition-opacity ${
          scrolled ? 'opacity-100' : 'opacity-0' // --- CSS transition ---
        }`}
      >
        {title}
      </h1>
    </header>
  );
};