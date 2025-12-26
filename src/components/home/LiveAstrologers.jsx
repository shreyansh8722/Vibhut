import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Star, ChevronRight } from 'lucide-react';

const astrologers = [
  { id: 1, name: "Pt. Ram Krishna", skill: "Vedic, Vastu", lang: "Hindi, Eng", exp: "15 Yr", rating: 4.9, status: "online", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Tarot Suman", skill: "Tarot, Reiki", lang: "Eng, Hin", exp: "8 Yr", rating: 4.8, status: "busy", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Acharya Rahul", skill: "Kundali, Face", lang: "Hindi", exp: "12 Yr", rating: 5.0, status: "online", img: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: 4, name: "Dr. Anjali", skill: "Love, Marriage", lang: "Eng, Tam", exp: "20 Yr", rating: 4.9, status: "online", img: "https://randomuser.me/api/portraits/women/68.jpg" },
];

const LiveAstrologers = () => {
  return (
    <section className="py-20 bg-orange-50/30 border-t border-orange-100">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-black">
              Chat with Astrologers
            </h2>
            <p className="text-gray-500 mt-4 text-sm max-w-md">Get instant clarity on Career, Love & Health from verified Vedic experts.</p>
          </div>
          <Link to="/consult" className="hidden md:flex items-center gap-1 text-sm font-bold text-[var(--color-primary)] hover:text-black transition-colors uppercase tracking-wider">
             View All Experts <ChevronRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {astrologers.map((astro) => (
            <div key={astro.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative hover:-translate-y-1">
               
               {/* Avatar */}
               <div className="flex justify-center mb-4 relative">
                  <div className="p-1 rounded-full border-2 border-dashed border-[var(--color-primary)]">
                     <img src={astro.img} alt={astro.name} className="w-20 h-20 rounded-full object-cover" />
                  </div>
                  <div className={`absolute bottom-1 right-8 w-4 h-4 border-2 border-white rounded-full ${astro.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
               </div>

               {/* Info */}
               <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-black leading-tight mb-1">{astro.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{astro.skill} • {astro.exp} Exp</p>
                  <div className="inline-flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-[10px] font-bold text-yellow-700">
                     <Star size={10} className="fill-yellow-500 text-yellow-500" /> {astro.rating}
                  </div>
               </div>

               {/* Actions */}
               <div className="flex gap-2">
                  <button className="flex-1 py-2.5 border border-green-500 text-green-600 rounded-xl text-xs font-bold uppercase hover:bg-green-50 transition-colors flex items-center justify-center gap-1.5">
                     <MessageCircle size={14} /> Chat
                  </button>
                  <button className="flex-1 py-2.5 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl text-xs font-bold uppercase hover:bg-[var(--color-primary)] hover:text-white transition-colors flex items-center justify-center gap-1.5">
                     <Phone size={14} /> Call
                  </button>
               </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
           <Link to="/consult" className="inline-block px-8 py-3 border border-gray-300 rounded-full text-xs font-bold uppercase text-gray-600">View All Experts</Link>
        </div>

      </div>
    </section>
  );
};

export default LiveAstrologers;