import React, { useState, memo, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ImageCarousel = memo(({ images = [], spotName = 'Spot' }) => {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const measureWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => {
      window.removeEventListener('resize', measureWidth);
    };
  }, []);

  const validImages = Array.isArray(images)
    ? images.filter((img) => typeof img === 'string' && img.trim() !== '')
    : [];
  const imageCount = validImages.length;

  const leftConstraint = useMemo(() => {
    if (containerWidth === 0) {
      return 0;
    }
    return -(imageCount - 1) * containerWidth;
  }, [imageCount, containerWidth]);

  const paginate = (newDirection) => {
    let newIndex = index + newDirection;
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= imageCount) {
      newIndex = imageCount - 1;
    }
    setIndex(newIndex);
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 40; 
    const velocityThreshold = 150; 
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (velocity < -velocityThreshold || offset < -swipeThreshold) {
      if (index < imageCount - 1) {
        paginate(1);
      }
    } else if (velocity > velocityThreshold || offset > swipeThreshold) {
      if (index > 0) {
        paginate(-1);
      }
    }
  };

  if (imageCount === 0) {
    return (
      <div className="fixed top-0 left-0 right-0 w-full h-80 bg-gray-200 dark:bg-gray-800 flex items-center justify-center z-0">
        <img
          src="https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image"
          alt="No image available"
          className="w-full h-full object-cover opacity-50"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 right-0 w-full h-80 overflow-hidden z-0 select-none bg-gray-200 dark:bg-gray-800"
    >
      <motion.div
        className="flex h-full w-full"
        drag="x"
        dragConstraints={{
          right: 0,
          left: leftConstraint,
        }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
      >
        {validImages.map((src, i) => {
          const shouldLoad = Math.abs(i - index) <= 1;

          return (
            <div key={i} className="w-full h-full flex-shrink-0">
              {shouldLoad ? (
                <img
                  src={src}
                  alt={`${spotName} image ${i + 1}`}
                  loading={i === index ? 'eager' : 'lazy'}
                  // FIX: Changed from fetchPriority to fetchpriority
                  fetchpriority={i === index ? 'high' : 'auto'}
                  className="w-full h-full object-cover"
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-700" />
              )}
            </div>
          );
        })}
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

      {imageCount > 1 && (
        <div className="absolute bottom-8 right-4 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-white text-xs font-medium pointer-events-none shadow-lg">
          {index + 1} / {imageCount}
        </div>
      )}
    </div>
  );
});