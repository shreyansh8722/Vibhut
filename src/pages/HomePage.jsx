import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// --- COMPONENTS ---
import Hero from '../components/home/Hero';
import OurCollections from '../components/home/OurCollections';     // 1. Our Collections
import NewArrivals from '../components/home/NewArrivals';           // 2. New Arrivals
import LiveAstrologers from '../components/home/LiveAstrologers';   // 3. Live Astro
import CollectionSpotlight from '../components/home/CollectionSpotlight'; // 4. Grid (The visual banner)
import BestSellers from '../components/home/BestSellers';           // 5. Best Sellers
import EducationSection from '../components/home/EducationSection'; // 7. Why Wear
import ShopByPurpose from '../components/home/ShopByPurpose';       // 8. Shop by Purpose
import SadhanaChallenge from '../components/home/SadhanaChallenge'; // 9. Sadhana
import Testimonials from '../components/home/Testimonials';         // 10. Testimonials

const Home = () => {
  return (
    <div className="bg-white min-h-screen font-body text-black">
      
      {/* HERO SECTION (Always Top) */}
      <Hero />

      {/* LIVE PULSE STRIP (Kept for aesthetic, moves with Hero) */}
      <div className="bg-black text-white py-3 overflow-hidden border-b border-gray-800">
         <div className="container mx-auto px-4 flex justify-between items-center text-xs font-bold tracking-widest uppercase">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
               <span className="text-[var(--color-primary)]">Live Status:</span>
               <span>Evening Aarti Preparation</span>
            </div>
            <div className="hidden md:flex gap-6 text-gray-500">
               <span>Sunrise: 06:12 AM</span>
               <span>Moon: Vrishabha</span>
            </div>
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
                 Best Selling Artifacts
               </h2>
               
               <Link to="/shop?sort=best_selling" className="hidden md:flex items-center gap-2 text-sm font-bold text-black hover:text-[var(--color-primary)] transition-colors uppercase tracking-wider">
                  View All Best Sellers <ArrowRight size={16} />
               </Link>
            </div>

            <BestSellers />

            <div className="mt-10 md:hidden text-center">
               <Link to="/shop?sort=best_selling">
                  <button className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded shadow-lg hover:bg-[var(--color-primary)] transition-colors">
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
  );
};

export default Home;