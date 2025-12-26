import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoveRight } from 'lucide-react';

export const CollectionSpotlight = () => {
  const navigate = useNavigate();
  return (
    <section className="py-12 md:py-24 px-4 md:px-12 bg-white">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
        
        {/* HERO CARD */}
        <div 
          onClick={() => navigate('/shop?category=Rudraksha')}
          className="md:col-span-8 group relative h-[50vh] md:h-[80vh] overflow-hidden cursor-pointer rounded-sm"
        >
          <img 
            src="https://images.unsplash.com/photo-1620331317562-239207095449?q=80&w=1600" 
            alt="Rudraksha Collection" 
            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white">
            <h3 className="font-heading text-4xl md:text-6xl font-bold mb-2">
              The Shiva Edit
            </h3>
            <p className="text-sm text-gray-300 mt-2 max-w-md hidden md:block">Handpicked Ek Mukhi and Gauri Shankar beads, energized in Kashi.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-transparent group-hover:border-[var(--color-primary)] transition-all pb-1 hover:text-[var(--color-primary)]">
              Explore Collection <MoveRight size={14} />
            </span>
          </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="md:col-span-4 flex flex-col gap-4 md:gap-8 h-auto md:h-[80vh]">
          
          <div 
            onClick={() => navigate('/shop?category=Gemstones')}
            className="group relative flex-1 overflow-hidden cursor-pointer min-h-[40vh] md:min-h-0 rounded-sm"
          >
            <img 
              src="https://images.unsplash.com/photo-1615485925763-867862f8099a?q=80&w=800" 
              alt="Gemstones" 
              className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="font-heading text-2xl md:text-3xl font-bold">
                Vedic Gemstones
              </h3>
            </div>
          </div>

          <div 
            onClick={() => navigate('/shop?category=Mala')}
            className="group relative flex-1 overflow-hidden cursor-pointer min-h-[40vh] md:min-h-0 rounded-sm"
          >
            <img 
              src="https://images.unsplash.com/photo-1603038930495-2c26279f6764?q=80&w=800" 
              alt="Malas" 
              className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="font-heading text-2xl md:text-3xl font-bold">
                Japa Malas
              </h3>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CollectionSpotlight;