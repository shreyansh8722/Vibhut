import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const purposes = [
  { 
    id: 'wealth', 
    title: 'Wealth & Prosperity', 
    sanskrit: 'Dhan Vriddhi', 
    description: 'Attract abundance and financial stability.',
    img: 'https://images.unsplash.com/photo-1621506821957-1b50ab77f739?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=wealth' 
  },
  { 
    id: 'health', 
    title: 'Health & Vitality', 
    sanskrit: 'Arogyam', 
    description: 'Boost immunity and physical well-being.',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=health' 
  },
  { 
    id: 'protection', 
    title: 'Protection Shield', 
    sanskrit: 'Raksha Kavach', 
    description: 'Ward off negative energies and evil eye.',
    img: 'https://images.unsplash.com/photo-1515966306806-03c73335e236?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=protection' 
  },
  { 
    id: 'love', 
    title: 'Love & Marriage', 
    sanskrit: 'Prem & Vivah', 
    description: 'Harmonize relationships and find love.',
    img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=marriage' 
  },
  { 
    id: 'peace', 
    title: 'Mental Peace', 
    sanskrit: 'Manah Shanti', 
    description: 'Relieve stress, anxiety and find calm.',
    img: 'https://images.unsplash.com/photo-1528319725582-ddc096101511?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=peace' 
  },
  { 
    id: 'career', 
    title: 'Career & Success', 
    sanskrit: 'Karyasiddhi', 
    description: 'Remove obstacles in business and job.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop', 
    link: '/shop?purpose=career' 
  }
];

const ShopByPurpose = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        
        {/* Header - Clean Style */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-black">
            Shop by Purpose
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purposes.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate(item.link)}
              className="group relative h-64 overflow-hidden rounded-sm cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              {/* Background Image */}
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:via-black/50 transition-colors" />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  
                  {/* Sanskrit Name (Hidden until hover) */}
                  <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest mb-1 block opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                    {item.sanskrit}
                  </span>
                  
                  <h3 className="font-heading text-2xl font-bold mb-2 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-gray-300 opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-500 delay-100 leading-relaxed max-w-[90%]">
                    {item.description}
                  </p>
                  
                  {/* Arrow Icon */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                     <ArrowRight size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShopByPurpose;