import React from 'react';
import { Phone, MessageCircle, Star, Filter, Calendar } from 'lucide-react';

const experts = [
  { id: 1, name: "Pt. Ram Krishna", skill: "Vedic, Vastu", lang: "Hindi, Eng", exp: "15 Yr", rating: 4.9, price: 500, status: "online", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Tarot Suman", skill: "Tarot, Reiki", lang: "Eng, Hin", exp: "8 Yr", rating: 4.8, price: 800, status: "busy", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Acharya Rahul", skill: "Kundali, Face", lang: "Hindi", exp: "12 Yr", rating: 5.0, price: 400, status: "online", img: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: 4, name: "Dr. Anjali", skill: "Love, Marriage", lang: "Eng, Tam", exp: "20 Yr", rating: 4.9, price: 1200, status: "online", img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: 5, name: "Swami Ayan", skill: "Numerology", lang: "Eng, Ben", exp: "10 Yr", rating: 4.7, price: 600, status: "offline", img: "https://randomuser.me/api/portraits/men/22.jpg" },
  { id: 6, name: "Devi Meera", skill: "Prashna, Nadi", lang: "Hin, San", exp: "25 Yr", rating: 5.0, price: 1500, status: "online", img: "https://randomuser.me/api/portraits/women/12.jpg" },
];

const ConsultPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      <div className="container mx-auto px-4">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <span className="text-[var(--color-primary)] font-bold tracking-[0.2em] uppercase text-xs block mb-3">
            Divine Guidance
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-black mb-4">
            Consult Vedic Experts
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Get instant clarity on your Career, Marriage, Health, and Finance from verified astrologers of Kashi.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4 items-center justify-between sticky top-20 z-30">
           <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Filter size={16} /> Filters:
           </div>
           <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              {['All', 'Vedic', 'Tarot', 'Numerology', 'Vastu'].map(filter => (
                 <button key={filter} className="px-4 py-1.5 rounded-full border border-gray-200 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors whitespace-nowrap">
                    {filter}
                 </button>
              ))}
           </div>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((astro) => (
            <div key={astro.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
               <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative">
                     <img src={astro.img} alt={astro.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
                     <div className={`absolute bottom-0 right-1 w-4 h-4 border-2 border-white rounded-full ${astro.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <h3 className="font-heading font-bold text-lg text-black">{astro.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
                           {astro.rating} <Star size={10} className="fill-current" />
                        </div>
                     </div>
                     <p className="text-xs text-gray-500 mt-1 mb-2">{astro.skill}</p>
                     <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{astro.lang}</p>
                     <p className="text-[10px] text-gray-400 font-bold mt-1">{astro.exp} Experience</p>
                  </div>
               </div>

               {/* Price & Actions */}
               <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                  <div className="text-left">
                     <span className="text-[10px] text-gray-400 font-bold uppercase block">Rate / min</span>
                     <span className="text-lg font-bold text-black">₹{astro.price}</span>
                  </div>
                  <div className="flex gap-2">
                     <button className="px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg text-xs font-bold uppercase hover:bg-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-2">
                        <MessageCircle size={16} /> Chat
                     </button>
                     <button className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <Phone size={16} /> Call
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ConsultPage;