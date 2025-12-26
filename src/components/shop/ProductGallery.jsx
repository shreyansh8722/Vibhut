import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images.length) return null;

  // Desktop Hover Zoom
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const nextImage = (e) => { e.stopPropagation(); setSelectedImage((prev) => (prev + 1) % images.length); };
  const prevImage = (e) => { e.stopPropagation(); setSelectedImage((prev) => (prev - 1 + images.length) % images.length); };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4 h-fit sticky top-24">
        
        {/* Thumbnails (Gold Active Border) */}
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide md:w-20 md:h-[500px] flex-shrink-0 px-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setSelectedImage(idx)}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-16 h-20 md:w-full md:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === idx 
                  ? 'border-[#B08D55] opacity-100 shadow-md scale-105' 
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#B08D55]/30'
              }`}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Main Image (Click to Lightbox) */}
        <div 
          className="relative flex-grow bg-[#FAFAFA] rounded-2xl overflow-hidden cursor-zoom-in group h-[400px] md:h-[600px] w-full shadow-sm"
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
        >
          <img src={images[selectedImage]} alt="Main" className="w-full h-full object-cover" />

          {/* Lens Zoom (Desktop) */}
          {showZoom && (
            <div 
              className="absolute inset-0 pointer-events-none hidden lg:block bg-no-repeat transition-opacity duration-200"
              style={{
                backgroundImage: `url(${images[selectedImage]})`,
                backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                backgroundSize: '250%',
              }}
            />
          )}
          
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 lg:hidden">
              <ZoomIn size={12} /> Tap to Zoom
          </div>
        </div>
      </div>

      {/* Lightbox (Mobile Pinch Zoom) */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in touch-none">
          <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full z-50"><X size={24} /></button>
          <button onClick={prevImage} className="absolute left-4 text-white p-2 bg-white/10 rounded-full z-50"><ChevronLeft size={32} /></button>
          <button onClick={nextImage} className="absolute right-4 text-white p-2 bg-white/10 rounded-full z-50"><ChevronRight size={32} /></button>

          <div className="w-full h-full p-4 flex items-center justify-center overflow-auto">
             <img 
               src={images[selectedImage]} 
               alt="Full Screen" 
               className="max-h-full max-w-full object-contain pointer-events-auto"
               style={{ touchAction: 'pinch-zoom' }}
             />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGallery;