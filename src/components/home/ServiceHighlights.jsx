import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// You will need to replace these src placeholders with your actual images of:
// 1. A Pandit/Pooja setup
// 2. An Astrological Chart or Hand
// 3. A close up of Rudraksha
const ServiceHighlights = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
        <div>
           <span className="text-primary font-bold tracking-widest uppercase text-xs">Beyond Products</span>
           <h2 className="font-heading text-3xl md:text-4xl font-bold text-black mt-2">Divine Services</h2>
        </div>
        <p className="text-gray-500 text-sm max-w-md text-right md:text-left">
          Authentic Vedic solutions performed in Kashi. Book online, attend virtually.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[500px]">
        
        {/* CARD 1: ASTROLOGY (Large) */}
        <div className="relative group overflow-hidden rounded-sm bg-gray-100 md:col-span-1 h-[300px] md:h-auto">
           {/* Background Image Placeholder */}
           <div className="absolute inset-0 bg-gray-200 transition-transform duration-700 group-hover:scale-105">
              {/* <img src={astrologyImg} className="w-full h-full object-cover opacity-80" /> */}
           </div>
           
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-white font-heading text-2xl font-bold mb-2">Vedic Astrology</h3>
              <p className="text-gray-300 text-sm mb-6 line-clamp-2">
                Struggling with Career or Marriage? Chat with certified astrologers. First call free for 5 mins.
              </p>
              <Link to="/consult">
                 <button className="bg-white text-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors">
                   Chat Now
                 </button>
              </Link>
           </div>
        </div>

        {/* RIGHT COLUMN SPLIT */}
        <div className="md:col-span-2 flex flex-col gap-6 h-full">
            
            {/* CARD 2: KASHI POOJA (Wide) */}
            <div className="relative group overflow-hidden rounded-sm bg-gray-100 flex-1 min-h-[200px]">
               <div className="absolute inset-0 bg-gray-300 transition-transform duration-700 group-hover:scale-105">
                 {/* <img src={poojaImg} className="w-full h-full object-cover" /> */}
               </div>
               <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors flex items-center justify-between p-8 md:px-12">
                  <div className="max-w-lg">
                     <h3 className="text-white font-heading text-2xl font-bold mb-1">Book Kashi Pooja</h3>
                     <p className="text-gray-200 text-sm">Sankalp in your name at Vishwanath Temple via Video Call.</p>
                  </div>
                  <Link to="/pooja-services" className="hidden md:block">
                     <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                        <ArrowRight size={20} />
                     </div>
                  </Link>
               </div>
            </div>

            {/* CARD 3 & 4 SPLIT */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[200px]">
               
               {/* CARD 3: PRAN PRATISHTA (The USP) */}
               <div className="relative bg-[#FFF5F5] border border-red-100 p-8 flex flex-col justify-center rounded-sm">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Exclusive</div>
                  <h3 className="font-heading text-xl font-bold text-black mb-2">Pran Pratishta</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-4">
                    Get your Rudraksha energized in your name. We send you the **Video Proof** for just ₹151.
                  </p>
                  <Link to="/shop" className="text-xs font-bold text-black underline hover:text-primary">
                    Add to Cart
                  </Link>
               </div>

               {/* CARD 4: FREE OFFER */}
               <div className="relative bg-gray-50 p-8 flex flex-col justify-center rounded-sm border border-gray-100">
                  <h3 className="font-heading text-xl font-bold text-black mb-2">Free Ganga Jal</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-4">
                    Delivered with every Rudraksha & Gemstone order. Pure purity from the Ghats.
                  </p>
                  <Link to="/shop" className="text-xs font-bold text-black underline hover:text-primary">
                    Shop Now
                  </Link>
               </div>

            </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights;