import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import hero1 from '../../assets/hero1.webp';
import hero2 from '../../assets/hero2.webp';
import hero3 from '../../assets/hero3.webp';

const Hero = () => {
  const images = [hero1, hero2, hero3];
  const [currentImage, setCurrentImage] = useState(0);

  // Slideshow Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-[85vh] bg-black overflow-hidden flex items-end justify-center pb-20">
      
      {/* Background Slideshow */}
      {images.map((img, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Image */}
          <img 
            src={img} 
            alt={`Slide ${index + 1}`} 
            className="w-full h-full object-cover opacity-60" 
          />
          {/* Dark Overlay for Button Contrast */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Buttons - Centered at Bottom */}
      <div className="relative z-10 flex flex-col md:flex-row gap-6 animate-fade-in mb-8 md:mb-12">
        <Link to="/shop">
          <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
            Shop Collection <ArrowRight size={16} />
          </button>
        </Link>
        <Link to="/consult">
          <button className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
            Talk to Astrologer <Phone size={16} />
          </button>
        </Link>
      </div>

    </div>
  );
};

export default Hero;