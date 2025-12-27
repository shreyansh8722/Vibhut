import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Truck, RefreshCw } from 'lucide-react';

// --- COMPONENTS ---
import Hero from '../components/home/Hero';
import OurCollections from '../components/home/OurCollections';
import NewArrivals from '../components/home/NewArrivals';
import LiveAstrologers from '../components/home/LiveAstrologers';
import CollectionSpotlight from '../components/home/CollectionSpotlight';
import BestSellers from '../components/home/BestSellers';
import EducationSection from '../components/home/EducationSection';
import ShopByPurpose from '../components/home/ShopByPurpose';
import SadhanaChallenge from '../components/home/SadhanaChallenge';
import Testimonials from '../components/home/Testimonials';

const Home = () => {
  const trustTags = [
    { icon: ShieldCheck, text: "100% Authentic & Certified" },
    { icon: Zap, text: "Energized in Kashi" },
    { icon: Truck, text: "Pan-India Shipping" },
    { icon: RefreshCw, text: "7-Day Easy Returns" },
    // Repeat for seamless loop
    { icon: ShieldCheck, text: "100% Authentic & Certified" },
    { icon: Zap, text: "Energized in Kashi" },
    { icon: Truck, text: "Pan-India Shipping" },
    { icon: RefreshCw, text: "7-Day Easy Returns" },
  ];

  return (
    <>
      {/* CSS for Marquee Animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      <div className="bg-white min-h-screen font-body text-black">
        
        {/* HERO SECTION */}
        <Hero />

        {/* NEW: AESTHETIC INFINITE MARQUEE */}
        <div className="bg-black text-white py-4 overflow-hidden border-b border-gray-800 relative z-20">
           <div className="flex gap-16 animate-marquee whitespace-nowrap px-4 w-max">
              {trustTags.map((tag, i) => (
                <div key={i} className="flex items-center gap-3 opacity-80">
                   <tag.icon size={14} className="text-[#B08D55]" />
                   <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">{tag.text}</span>
                </div>
              ))}
           </div>
        </div>

        {/* 1. OUR COLLECTIONS */}
        <OurCollections />

        {/* 2. NEW ARRIVALS */}
        <NewArrivals />

        {/* 3. LIVE ASTROLOGERS */}
        <LiveAstrologers />

        {/* 4. GRID (Collection Spotlight) */}
        <CollectionSpotlight />

        {/* 5. BEST SELLERS */}
        <section className="py-16 bg-white border-t border-gray-100">
           <div className="container mx-auto px-4">
              
              <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
                 <h2 className="font-heading text-3xl md:text-4xl font-bold text-black">
                   Best Sellers 
                 </h2>
                 
                 <Link to="/shop?sort=best_selling" className="hidden md:flex items-center gap-2 text-sm font-bold text-black hover:text-[#B08D55] transition-colors uppercase tracking-wider">
                    View All Best Sellers <ArrowRight size={16} />
                 </Link>
              </div>

              <BestSellers />

              <div className="mt-10 md:hidden text-center">
                 <Link to="/shop?sort=best_selling">
                    <button className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded shadow-lg hover:bg-[#B08D55] transition-colors">
                       View All Best Sellers
                    </button>
                 </Link>
              </div>

           </div>
        </section>

        {/* 7. WHY WEAR (Education) */}
        <EducationSection />

        {/* 8. SHOP BY PURPOSE */}
        <ShopByPurpose />

        {/* 9. SADHANA CHALLENGE */}
        <SadhanaChallenge />

        {/* 10. TESTIMONIALS */}
        <Testimonials />

      </div>
    </>
  );
};

export default Home;