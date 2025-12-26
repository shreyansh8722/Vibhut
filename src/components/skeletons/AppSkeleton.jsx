import React from 'react';

export const AppSkeleton = () => {
  return (
    <div className="min-h-screen bg-white animate-pulse font-sans overflow-hidden">
      
      {/* 1. Navbar Skeleton */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
         {/* Announcement Bar */}
         <div className="h-8 bg-gray-50 w-full"></div>
         
         {/* Main Header */}
         <div className="px-4 py-3 md:px-8 flex items-center justify-between h-16 md:h-20">
            {/* Left Actions */}
            <div className="flex gap-4 w-1/3">
               <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
               <div className="w-8 h-8 bg-gray-200 rounded-full hidden md:block"></div>
            </div>
            
            {/* Logo Placeholder */}
            <div className="w-1/3 flex justify-center">
               <div className="w-32 h-10 bg-gray-200 rounded-sm"></div>
            </div>
            
            {/* Right Actions */}
            <div className="flex gap-4 w-1/3 justify-end">
               <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
               <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
         </div>
      </div>

      {/* 2. Hero Section Skeleton */}
      {/* Matches the 90vh height of your real hero for smooth transition */}
      <div className="relative w-full h-[85vh] md:h-[90vh] bg-gray-200 flex flex-col justify-end pb-24 items-center">
         {/* Button Placeholder */}
         <div className="w-48 h-12 bg-white/50 backdrop-blur-sm rounded-sm"></div>
         
         {/* Navigation Dots Placeholder */}
         <div className="absolute bottom-8 flex gap-2">
            <div className="w-8 h-1.5 bg-white/50 rounded-full"></div>
            <div className="w-2 h-1.5 bg-white/20 rounded-full"></div>
            <div className="w-2 h-1.5 bg-white/20 rounded-full"></div>
         </div>
      </div>

      {/* 3. Categories Strip Skeleton */}
      <div className="py-16 px-4">
         <div className="h-8 w-48 bg-gray-200 mx-auto mb-10 rounded-sm"></div>
         <div className="flex gap-8 overflow-hidden justify-center opacity-60">
            {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex flex-col items-center gap-4 shrink-0">
                  <div className="w-24 h-24 md:w-40 md:h-40 bg-gray-200 rounded-full border-4 border-white shadow-sm"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded-sm"></div>
               </div>
            ))}
         </div>
      </div>

      {/* 4. Product Grid Skeleton (New Arrivals) */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-12">
        <div className="flex justify-between items-end mb-8">
            <div className="space-y-3">
                <div className="w-64 h-10 bg-gray-200 rounded-sm"></div>
                <div className="w-40 h-4 bg-gray-100 rounded-sm"></div>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-gray-200 rounded-sm"></div>
                    <div className="h-4 bg-gray-200 w-3/4 rounded-sm"></div>
                    <div className="h-4 bg-gray-200 w-1/2 rounded-sm"></div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};