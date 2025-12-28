import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

// --- UTILITY: THROTTLE (To fix scroll lag) ---
const useThrottle = (callback, delay) => {
  const lastCall = useRef(0);
  return useCallback((...args) => {
    const now = new Date().getTime();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]);
};

// --- SUB-COMPONENT: PRO LIGHTBOX (Direct DOM Physics) ---
const Lightbox = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Refs for 60FPS Animations
  const imageRef = useRef(null);
  const transform = useRef({ x: 0, y: 0, scale: 1 });
  const startTouch = useRef({ x: 0, y: 0, dist: 0 });
  const isDragging = useRef(false);
  const lastTap = useRef(0);

  // Reset when slide changes
  useEffect(() => {
    transform.current = { x: 0, y: 0, scale: 1 };
    if (imageRef.current) {
      imageRef.current.style.transition = 'none';
      imageRef.current.style.transform = `translate3d(0,0,0) scale(1)`;
    }
  }, [currentIndex]);

  const updateDOM = (transition = false) => {
    if (!imageRef.current) return;
    imageRef.current.style.transition = transition ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
    const { x, y, scale } = transform.current;
    imageRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  };

  const getDistance = (touches) => {
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    imageRef.current.style.transition = 'none'; // Instant response

    if (e.touches.length === 1) {
      // Pan / Swipe Start
      startTouch.current = { 
        x: e.touches[0].clientX - transform.current.x, 
        y: e.touches[0].clientY - transform.current.y,
        dist: 0
      };
    } else if (e.touches.length === 2) {
      // Pinch Start
      startTouch.current.dist = getDistance(e.touches);
      startTouch.current.startScale = transform.current.scale;
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault(); // Stop browser scroll

    if (e.touches.length === 1) {
      // Moving
      const x = e.touches[0].clientX - startTouch.current.x;
      const y = e.touches[0].clientY - startTouch.current.y;

      if (transform.current.scale > 1) {
        // Free Pan (Zoomed)
        transform.current.x = x;
        transform.current.y = y;
      } else {
        // Horizontal Swipe (Not Zoomed)
        transform.current.x = x;
        // Resistance at edges
        if ((currentIndex === 0 && x > 0) || (currentIndex === images.length - 1 && x < 0)) {
           transform.current.x = x * 0.4;
        }
      }
    } else if (e.touches.length === 2) {
      // Pinching
      const dist = getDistance(e.touches);
      const scaleFactor = dist / startTouch.current.dist;
      transform.current.scale = Math.max(1, Math.min(startTouch.current.startScale * scaleFactor, 4));
    }
    
    // Direct Update (No React State)
    updateDOM(false);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    const { x, scale } = transform.current;

    if (scale > 1) {
      // Zoom Cleanup
      if (scale < 1) transform.current.scale = 1; // Prevent shrinking < 1
      updateDOM(true);
    } else {
      // Swipe Navigation Logic
      const threshold = window.innerWidth * 0.25; // 25% screen width
      if (x > threshold && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (x < -threshold && currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Snap Back
        transform.current.x = 0;
        transform.current.y = 0;
        updateDOM(true);
      }
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double Tap Action
      if (transform.current.scale > 1) {
        transform.current = { x: 0, y: 0, scale: 1 };
      } else {
        transform.current = { x: 0, y: 0, scale: 2.5 };
      }
      updateDOM(true);
    }
    lastTap.current = now;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black touch-none animate-fade-in flex flex-col">
      {/* Header */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <span className="text-white/90 font-bold tracking-widest text-sm">{currentIndex + 1} / {images.length}</span>
        <button onClick={onClose} className="pointer-events-auto p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30">
          <X size={20} />
        </button>
      </div>

      {/* Main Image Stage */}
      <div 
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
      >
        <img
          ref={imageRef}
          src={images[currentIndex]}
          alt="Zoom"
          draggable="false"
          className="max-h-full max-w-full object-contain pointer-events-auto will-change-transform"
        />
      </div>

      {/* Footer Nav */}
      <div className="absolute bottom-10 w-full flex justify-center gap-8 pointer-events-none z-20">
         <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(c => Math.max(0, c-1)); }} className="pointer-events-auto p-3 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20"><ChevronLeft/></button>
         <button 
           className="pointer-events-auto p-3 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20"
           onClick={() => {
             // Manual Zoom Toggle
             if (transform.current.scale > 1) { transform.current = { x: 0, y: 0, scale: 1 }; } 
             else { transform.current = { x: 0, y: 0, scale: 2.5 }; }
             updateDOM(true);
           }}
         >
           <Maximize2 size={20} />
         </button>
         <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(c => Math.min(images.length-1, c+1)); }} className="pointer-events-auto p-3 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20"><ChevronRight/></button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const ProductGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const scrollRef = useRef(null);

  if (!images.length) return null;

  // Sync Desktop click -> Mobile Scroll
  useEffect(() => {
    if (scrollRef.current && scrollRef.current.scrollLeft !== selectedImage * scrollRef.current.offsetWidth) {
      scrollRef.current.scrollTo({ left: selectedImage * scrollRef.current.offsetWidth, behavior: 'smooth' });
    }
  }, [selectedImage]);

  // Throttled Scroll Handler (Optimizes Performance)
  const handleScroll = useThrottle(() => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
      if (index !== selectedImage) setSelectedImage(index);
    }
  }, 100); // Only check every 100ms

  // Desktop Hover Logic
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100
    });
  };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4 h-fit sticky top-24 select-none">
        
        {/* DESKTOP THUMBNAILS (Hidden on Mobile) */}
        <div className="hidden md:flex md:flex-col gap-3 overflow-y-auto scrollbar-hide md:w-20 md:h-[500px] flex-shrink-0 px-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setSelectedImage(idx)}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-full h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === idx ? 'border-[#B08D55] opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* MOBILE CAROUSEL (Aspect Square) */}
        <div className="md:hidden relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAFAFA]">
           <div 
             ref={scrollRef}
             onScroll={handleScroll}
             className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-y"
           >
             {images.map((img, idx) => (
               <img 
                 key={idx} 
                 src={img} 
                 onClick={() => setIsLightboxOpen(true)}
                 className="w-full h-full object-cover flex-shrink-0 snap-center" 
                 alt="Product"
               />
             ))}
           </div>

           {/* Mobile Nav Overlay */}
           <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2">
             <button 
               onClick={(e) => { e.stopPropagation(); if(selectedImage > 0) setSelectedImage(selectedImage - 1); }}
               className={`pointer-events-auto p-2 bg-white/80 backdrop-blur rounded-full shadow-sm text-black transition-opacity ${selectedImage === 0 ? 'opacity-0' : 'opacity-100'}`}
             >
               <ChevronLeft size={20} />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); if(selectedImage < images.length - 1) setSelectedImage(selectedImage + 1); }}
               className={`pointer-events-auto p-2 bg-white/80 backdrop-blur rounded-full shadow-sm text-black transition-opacity ${selectedImage === images.length - 1 ? 'opacity-0' : 'opacity-100'}`}
             >
               <ChevronRight size={20} />
             </button>
           </div>

           {/* Mobile Dots */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
             {images.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all shadow-sm ${i === selectedImage ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
             ))}
           </div>
           
           <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 pointer-events-none">
              <ZoomIn size={12} />
           </div>
        </div>

        {/* DESKTOP MAIN IMAGE */}
        <div 
          className="hidden md:block relative flex-grow bg-[#FAFAFA] rounded-2xl overflow-hidden cursor-zoom-in group h-[600px] w-full shadow-sm"
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
        >
          <img src={images[selectedImage]} alt="Main" className="w-full h-full object-cover transition-opacity duration-300" />
          {showZoom && (
            <div 
              className="absolute inset-0 pointer-events-none bg-no-repeat z-10 bg-white"
              style={{
                backgroundImage: `url("${images[selectedImage]}")`,
                backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                backgroundSize: '200%', 
              }}
            />
          )}
        </div>
      </div>

      {/* RENDER LIGHTBOX IF OPEN */}
      {isLightboxOpen && (
        <Lightbox 
          images={images} 
          initialIndex={selectedImage} 
          onClose={() => setIsLightboxOpen(false)} 
        />
      )}
    </>
  );
};

export default ProductGallery;