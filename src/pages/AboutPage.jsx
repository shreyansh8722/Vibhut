import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const HERO_IMG = "https://images.unsplash.com/photo-1596230529625-7eeeff6f1a8c?q=80&w=2000";
  const WEAVER_IMG = "https://images.unsplash.com/photo-1610189012906-47833d7b3a4c?q=80&w=1200";
  const CITY_IMG = "https://images.unsplash.com/photo-1561585646-fa1fb90b9c71?q=80&w=1200"; 

  return (
    <div className="min-h-screen bg-white font-body text-black selection:bg-[var(--color-primary)] selection:text-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative h-[65vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img src={HERO_IMG} alt="The Loom" className="w-full h-full object-cover" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center text-white px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xs font-bold font-body uppercase tracking-[0.3em] mb-4 bg-black/30 px-4 py-2 backdrop-blur-md border border-white/20"
          >
            Since 1985
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="font-heading text-5xl md:text-7xl font-bold leading-tight"
          >
            Preserving the <br/> Soul of Banaras
          </motion.h1>
        </div>
      </div>

      {/* --- CHAPTER 1: THE ORIGIN --- */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-[0.2em] block">01. The Origin</span>
            <h2 className="font-heading text-4xl md:text-5xl text-black font-bold leading-tight">
              "We don't just weave cloth; <br/> we weave history."
            </h2>
            <div className="space-y-6 text-gray-500 text-lg leading-relaxed font-light">
              <p>
                Vishwanatham was born from a profound realization: the ancient art of handloom weaving, 
                passed down through generations in the alleys of Kashi, was being drowned out by mass production.
              </p>
              <p>
                Founded by a family of textile connoisseurs, our mission is to create a sanctuary for the *Kadhua* technique. 
                Every piece is a labor of love, taking weeks to complete.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm">
              <img src={WEAVER_IMG} alt="Master Weaver" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* --- CHAPTER 2: THE CITY --- */}
      <section className="bg-gray-50 py-24 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
             <div className="aspect-square bg-white p-2 border border-gray-200 shadow-xl">
               <img src={CITY_IMG} alt="Varanasi Ghats" className="w-full h-full object-cover" />
             </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <span className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-[0.2em] block">02. The Muse</span>
            <h2 className="font-heading text-4xl md:text-5xl text-black font-bold leading-tight">
              Kashi: The City of Light
            </h2>
            <div className="space-y-6 text-gray-500 text-lg leading-relaxed font-light">
              <p>
                Our designs are whispered by the city itself. The geometric patterns of the *Ghats*, 
                the floral motifs from temple offerings, and the golden hues of the evening *Aarti*—all find their way into our textiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}