import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Spotlight = ({ 
  data = {}, 
  align = "left" 
}) => {
  const navigate = useNavigate();

  // DEFAULTS
  const {
    title = "The Festive Edit",
    subtitle = "Handpicked classics for the season of lights.",
    buttonText = "View Collection",
    image = "https://images.unsplash.com/photo-1610189012906-47833d772097?q=80&w=1200"
  } = data || {};

  return (
    <section className="py-20 px-4 md:px-12 bg-white">
      <div className="max-w-[1800px] mx-auto">
        <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
          
          <div className="w-full md:w-3/5 h-[60vh] md:h-[80vh] relative overflow-hidden group rounded-lg">
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"/>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="w-full md:w-2/5 text-center md:text-left">
             <span className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-[0.25em] mb-4 block">Curated Collection</span>
             <h2 className="font-heading text-5xl md:text-6xl text-black mb-6 leading-tight font-bold">{title}</h2>
             <p className="font-body text-gray-500 text-lg font-light leading-relaxed mb-10 max-w-md mx-auto md:mx-0">{subtitle}</p>
             <button onClick={() => navigate('/shop')} className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--color-primary)] transition-colors shadow-lg rounded">
               {buttonText} <ArrowRight size={16} />
             </button>
          </div>
        </div>
      </div>
    </section>
  );
};