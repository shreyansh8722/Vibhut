import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export const ImageZoomModal = ({ isOpen, onClose, images, initialIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // We use a manual ref update strategy to handle AnimatePresence mounting/unmounting
  const imgRef = useRef(null); 
  const containerRef = useRef(null);
  const promptRef = useRef(null);
  
  // Mutable state for high-performance gestures (60fps)
  const state = useRef({
    x: 0,
    y: 0,
    scale: 1,
    isPanning: false,
    pinchCenter: { x: 0, y: 0 },
    startDist: 0,
    startScale: 1,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0
  });

  const lastTap = useRef(0);

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      setDirection(0);
      resetZoom(false);
    }
  }, [isOpen, initialIndex]);

  // FIX: Manually update the imgRef to point to the ACTIVE image element
  // whenever the index changes. This prevents the "exiting" image from nullifying the ref.
  useEffect(() => {
    if (containerRef.current) {
        const activeImg = containerRef.current.querySelector(`img[data-index="${activeIndex}"]`);
        if (activeImg) {
            imgRef.current = activeImg;
            resetZoom(true);
        }
    }
  }, [activeIndex]);

  const getBoundaries = (currentScale) => {
    if (!containerRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const { offsetWidth: w, offsetHeight: h } = containerRef.current;
    
    const overflowX = Math.max(0, (w * currentScale - w) / 2);
    const overflowY = Math.max(0, (h * currentScale - h) / 2);
    
    return { minX: -overflowX, maxX: overflowX, minY: -overflowY, maxY: overflowY };
  };

  const updateTransform = useCallback((animate = false) => {
    if (imgRef.current) {
      const { x, y, scale } = state.current;
      imgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      
      // Use standard ease-out for natural feel, no bounce
      imgRef.current.style.transition = animate ? 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
      
      if (promptRef.current) {
        promptRef.current.style.opacity = scale > 1.01 ? '0' : '1';
        promptRef.current.style.pointerEvents = 'none';
      }
    }
  }, []);

  const resetZoom = (animate = true) => {
    state.current = { x: 0, y: 0, scale: 1, isPanning: false };
    updateTransform(animate);
  };

  // --- NAVIGATION ---
  const handleNext = useCallback((e) => { 
    e?.stopPropagation(); 
    if (isAnimating) return;
    setDirection(1);
    setActiveIndex((p) => (p + 1) % images.length); 
  }, [images.length, isAnimating]);
  
  const handlePrev = useCallback((e) => { 
    e?.stopPropagation(); 
    if (isAnimating) return;
    setDirection(-1);
    setActiveIndex((p) => (p - 1 + images.length) % images.length); 
  }, [images.length, isAnimating]);

  // --- TOUCH / GESTURE LOGIC ---
  const onTouchStart = (e) => {
    if (isAnimating) return; 

    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        handleDoubleTap(e.touches[0]);
        lastTap.current = 0;
        return;
      }
      lastTap.current = now;

      state.current.isPanning = true;
      state.current.startX = e.touches[0].clientX;
      state.current.startY = e.touches[0].clientY;
      state.current.startPanX = state.current.x;
      state.current.startPanY = state.current.y;

    } else if (e.touches.length === 2) {
      state.current.isPanning = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      state.current.startDist = dist;
      state.current.startScale = state.current.scale;

      const rect = containerRef.current.getBoundingClientRect();
      state.current.pinchCenter = {
        x: (t1.clientX + t2.clientX) / 2 - (rect.left + rect.width / 2),
        y: (t1.clientY + t2.clientY) / 2 - (rect.top + rect.height / 2)
      };
      state.current.startPanX = state.current.x;
      state.current.startPanY = state.current.y;
    }
  };

  const onTouchMove = (e) => {
    if (!state.current.isPanning || isAnimating) return;

    if (e.touches.length === 2) {
      // --- PINCH ZOOM ---
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      
      if (state.current.startDist === 0) return;

      const ratio = dist / state.current.startDist;
      
      const newScale = Math.min(Math.max(state.current.startScale * ratio, 0.5), 8);
      
      const scaleRatio = newScale / state.current.startScale;
      const moveX = state.current.pinchCenter.x - (state.current.pinchCenter.x - state.current.startPanX) * scaleRatio;
      const moveY = state.current.pinchCenter.y - (state.current.pinchCenter.y - state.current.startPanY) * scaleRatio;

      state.current.scale = newScale;
      state.current.x = moveX;
      state.current.y = moveY;
      updateTransform(false);

    } else if (e.touches.length === 1) {
      // --- PANNING / SWIPING ---
      const dx = e.touches[0].clientX - state.current.startX;
      const dy = e.touches[0].clientY - state.current.startY;

      if (state.current.scale <= 1.05) { 
         // SWIPE LOGIC
         state.current.x = dx;
         state.current.y = 0; 
         updateTransform(false);
      } else {
         // PAN LOGIC
         let newX = state.current.startPanX + dx;
         let newY = state.current.startPanY + dy;
         const bounds = getBoundaries(state.current.scale);
         
         if (newX > bounds.maxX) newX = bounds.maxX + (newX - bounds.maxX) * 0.3;
         else if (newX < bounds.minX) newX = bounds.minX - (bounds.minX - newX) * 0.3;

         if (newY > bounds.maxY) newY = bounds.maxY + (newY - bounds.maxY) * 0.3;
         else if (newY < bounds.minY) newY = bounds.minY - (bounds.minY - newY) * 0.3;

         state.current.x = newX;
         state.current.y = newY;
         updateTransform(false);
      }
    }
  };

  const onTouchEnd = (e) => {
    if (e.touches.length > 0) {
        const t = e.touches[0];
        state.current.startX = t.clientX;
        state.current.startY = t.clientY;
        state.current.startPanX = state.current.x;
        state.current.startPanY = state.current.y;
        return; 
    }

    state.current.isPanning = false;

    if (state.current.scale < 1) {
        resetZoom(true);
    } else if (state.current.scale <= 1.05) {
        const swipeThreshold = 50;
        if (state.current.x > swipeThreshold) {
            handlePrev();
        } else if (state.current.x < -swipeThreshold) {
            handleNext();
        } else {
            resetZoom(true);
        }
    } else {
        const bounds = getBoundaries(state.current.scale);
        let targetX = state.current.x;
        let targetY = state.current.y;
        let needsSnap = false;

        if (state.current.x > bounds.maxX) { targetX = bounds.maxX; needsSnap = true; }
        else if (state.current.x < bounds.minX) { targetX = bounds.minX; needsSnap = true; }
        if (state.current.y > bounds.maxY) { targetY = bounds.maxY; needsSnap = true; }
        else if (state.current.y < bounds.minY) { targetY = bounds.minY; needsSnap = true; }

        if (needsSnap) {
            state.current.x = targetX;
            state.current.y = targetY;
            updateTransform(true);
        }
    }
  };

  const handleDoubleTap = (touch) => {
    if (state.current.scale > 1.1) {
      resetZoom(true);
    } else {
      const container = containerRef.current.getBoundingClientRect();
      const targetScale = 2.5; 
      const tapX = touch.clientX - (container.left + container.width / 2);
      const tapY = touch.clientY - (container.top + container.height / 2);
      
      const targetX = -tapX * (targetScale - 1);
      const targetY = -tapY * (targetScale - 1);
      
      state.current = { x: targetX, y: targetY, scale: targetScale, isPanning: false };
      updateTransform(true);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
    }),
    center: {
      zIndex: 1,
      x: 0,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* --- AMBIENT BACKGROUND LAYER --- */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-black/90 z-0" />
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={activeIndex}
                    src={images[activeIndex]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full object-cover blur-[80px] z-10 scale-110"
                />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/20 z-20" /> 
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
            <div className="pointer-events-auto text-white/90 text-sm font-medium tracking-wide drop-shadow-md font-mono">
              {activeIndex + 1} / {images.length}
            </div>
            <button 
              onClick={onClose}
              className="pointer-events-auto p-3 bg-transparent hover:bg-white/10 rounded-full transition-colors text-white drop-shadow-md"
            >
              <X size={26} strokeWidth={1.5} />
            </button>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 z-40 h-24 w-12 flex items-center justify-center bg-transparent hover:bg-white/5 transition-colors outline-none cursor-pointer"
          >
            <ChevronLeft size={32} strokeWidth={1} className="text-white/80 drop-shadow-lg" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-0 z-40 h-24 w-12 flex items-center justify-center bg-transparent hover:bg-white/5 transition-colors outline-none cursor-pointer"
          >
            <ChevronRight size={32} strokeWidth={1} className="text-white/80 drop-shadow-lg" />
          </button>

          {/* Main Image Container */}
          <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center overflow-hidden z-30 touch-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence 
              initial={false} 
              custom={direction} 
              mode="popLayout"
            >
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", ease: "circOut", duration: 0.25 }
                }}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
                className="absolute inset-0 flex items-center justify-center w-full h-full"
              >
                <img
                  // We remove ref={imgRef} here and update it manually in useEffect
                  // using the data-index attribute to target the correct element.
                  data-index={activeIndex}
                  src={images[activeIndex]}
                  alt="Zoom View"
                  className="max-w-full max-h-screen object-contain select-none shadow-2xl"
                  draggable="false"
                  style={{ 
                    cursor: 'grab', 
                    touchAction: 'none',
                    transformOrigin: 'center center',
                    willChange: 'transform'
                  }}
                /> 
              </motion.div>
            </AnimatePresence>

            {/* Prompt */}
            <div
              ref={promptRef}
              className="absolute bottom-10 pointer-events-none flex flex-col items-center gap-2 transition-opacity duration-300 z-10"
            >
              <div className="bg-white/10 backdrop-blur-md text-white/90 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] border border-white/10 shadow-lg">
                DOUBLE TAP
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};