import React from 'react';
import { Loader2 } from 'lucide-react'; // Using Loader2 for a sleek, modern spinner

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-700">
      <div className="flex flex-col items-center p-8 rounded-lg bg-white shadow-md">
        <Loader2 className="animate-spin h-10 w-10 text-black mb-4" /> {/* Sleek black spinner */}
        <p className="text-lg font-medium">Loading content...</p>
        <p className="text-sm text-gray-500 mt-1">Please wait a moment.</p>
      </div>
    </div>
  );
}