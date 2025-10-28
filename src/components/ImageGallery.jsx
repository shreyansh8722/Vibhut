// src/components/ImageGallery.jsx
import React from "react";

export default function ImageGallery({ imageUrls }) {
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
        No images available
      </div>
    );
  }

  const display = imageUrls.slice(0, 6);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-lg overflow-hidden">
      {display.map((url, idx) => (
        <div key={idx} className={`${idx === 0 ? "col-span-2 row-span-2" : ""} bg-gray-200`}>
          <img src={url} className="w-full h-full object-cover" alt={`Spot image ${idx+1}`} />
        </div>
      ))}
    </div>
  );
}
