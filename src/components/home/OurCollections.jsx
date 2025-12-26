import React from 'react';
import { useNavigate } from 'react-router-dom';

const collections = [
  { id: 'rudraksha', label: 'Rudraksha', img: 'https://images.unsplash.com/photo-1611568285568-3d846513369a?q=80&w=300&h=300&fit=crop' },
  { id: 'malas', label: 'Japa Malas', img: 'https://images.unsplash.com/photo-1603038930495-2c26279f6764?q=80&w=300&h=300&fit=crop' },
  { id: 'gemstones', label: 'Gemstones', img: 'https://images.unsplash.com/photo-1590424600100-3486df5b9745?q=80&w=300&h=300&fit=crop' },
  { id: 'yantras', label: 'Yantras', img: 'https://images.unsplash.com/photo-1623151834261-24874f676239?q=80&w=300&h=300&fit=crop' },
  { id: 'idols', label: 'God Idols', img: 'https://images.unsplash.com/photo-1567113300190-484852086433?q=80&w=300&h=300&fit=crop' },
  { id: 'bracelets', label: 'Bracelets', img: 'https://images.unsplash.com/photo-1615486511484-92e172cc416d?q=80&w=300&h=300&fit=crop' },
  { id: 'incense', label: 'Incense', img: 'https://images.unsplash.com/photo-1602150993952-47526710b77b?q=80&w=300&h=300&fit=crop' },
  { id: 'pooja', label: 'Pooja Items', img: 'https://images.unsplash.com/photo-1604928172322-9213fb385202?q=80&w=300&h=300&fit=crop' },
];

const OurCollections = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 text-center">
        
        {/* Header */}
        <div className="mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-black">
            Our Collections
          </h2>
        </div>

        {/* Circular Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-8 md:gap-6 justify-center">
          {collections.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate(`/shop?category=${item.id}`)}
              className="flex flex-col items-center gap-4 group cursor-pointer"
            >
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full p-1 border-2 border-transparent group-hover:border-[var(--color-primary)] transition-all duration-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 relative">
                   <img 
                     src={item.img} 
                     alt={item.label} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                   />
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">
                {item.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default OurCollections;