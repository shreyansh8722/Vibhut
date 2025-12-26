import React from 'react';
import { Play } from 'lucide-react';

export const HeritageStrip = () => {
  return (
    <section className="relative w-full h-[80vh] overflow-hidden bg-gray-900">
      {/* Background Image / Video */}
      <img 
        src="https://images.unsplash.com/photo-1606744888123-2479e4362143?q=80&w=2000" 
        alt="Weaver working" 
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      
      {/* Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1800px] mx-auto px-6 md:px-20 w-full">
            <div className="max-w-2xl border-l-2 border-[#B08D55] pl-8 md:pl-12">
                <span className="text-[#B08D55] text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
                    Legacy of the Loom
                </span>
                <h2 className="font-serif text-5xl md:text-7xl text-white mb-8 leading-none">
                    100 Hours of <br/> 
                    <span className="italic font-light text-white/80">Devotion</span>
                </h2>
                <p className="font-sans text-gray-300 text-lg font-light leading-relaxed mb-10 max-w-lg">
                    Every thread tells a story. From the dyeing of the silk to the rhythm of the handloom, we preserve a 500-year-old tradition that machines can never replicate.
                </p>
                
                <div className="flex items-center gap-6">
                    <button className="bg-white text-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#B08D55] hover:text-white transition-colors">
                        Read Our Story
                    </button>
                    <button className="flex items-center gap-3 text-white text-[10px] font-bold uppercase tracking-[0.2em] group">
                        <span className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                            <Play size={12} fill="currentColor" />
                        </span>
                        Watch Film
                    </button>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};