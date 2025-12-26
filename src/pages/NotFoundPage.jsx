import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-body text-black flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Decorative Background Text (Subtle Watermark) */}
        <h1 className="text-[150px] md:text-[300px] font-heading font-bold text-gray-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
          404
        </h1>

        <div className="relative z-10 max-w-lg mx-auto">
            <p className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-[0.3em] mb-4">Page Not Found</p>
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-black mb-6">Lost in the Weave?</h2>
            <p className="text-gray-500 mb-10 leading-relaxed text-lg">
              The page you are looking for might have been moved, removed, or possibly never existed. 
              Let's guide you back to our finest collections.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/')} 
                className="bg-black text-white px-8 py-4 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Home size={16} /> Return Home
              </button>
              <button 
                onClick={() => navigate('/shop')} 
                className="bg-white border border-gray-300 text-black px-8 py-4 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-black hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Search size={16} /> Browse Shop
              </button>
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}