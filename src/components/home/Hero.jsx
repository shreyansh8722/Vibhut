import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Images
import hero2 from '../../assets/hero2.webp';
import hero3 from '../../assets/hero3.webp';

const Hero = () => {
  const images = ["/hero1.webp", hero2, hero3]; 
  const [currentImage, setCurrentImage] = useState(0);

  // Slideshow Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    // FIXES: Reduced height further 
    // h-[50vh] for mobile, md:h-[75vh] for laptop
    <div className="relative w-full h-[50vh] md:h-[75vh] bg-black overflow-hidden flex items-end justify-center pb-10 md:pb-16">
      
      {/* Background Slideshow */}
      {images.map((img, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={img} 
            alt={`Vishwanatham Spiritual Artifacts - Slide ${index + 1}`} 
            className="w-full h-full object-cover object-center opacity-60"
            fetchpriority={index === 0 ? "high" : "auto"} 
            loading={index === 0 ? "eager" : "lazy"}      
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Single Small Minimal Button */}
      <div className="relative z-10 animate-fade-in">
        <Link to="/shop">
          <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 flex items-center gap-2">
            Shop Now <ArrowRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;