import React, { useState, useEffect, useRef } from "react";

export const LazyImage = ({ src, alt, className, isPriority = false }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    // If the image is already cached by the browser, mark as loaded immediately
    if (img && img.complete) {
      setLoaded(true);
    }
  }, []); // Run once on mount

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* Skeleton: Only show if NOT loaded */}
      {!loaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse z-10"
          aria-hidden="true"
        />
      )}
      
      <img
        ref={imgRef}
        src={src}
        alt={alt || "Pahnawa Banaras"}
        loading={isPriority ? "eager" : "lazy"}
        // React expects lowercase 'fetchpriority' for this attribute
        fetchpriority={isPriority ? "high" : "auto"}
        // NEW: Helps browser allocate space/resources correctly
        sizes="(max-width: 768px) 100vw, 50vw" 
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};