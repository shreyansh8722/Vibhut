import React from 'react';
import { Scissors, Check } from 'lucide-react';

const ProductCustomization = ({ options, onOptionsChange }) => {
  const toggleOption = (key) => {
    onOptionsChange(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="py-6 border-t border-gray-100">
      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
        <Scissors size={14} /> Customization Services
      </h4>
      
      <div className="space-y-3">
        {/* Option 1: Fall & Pico */}
        <div 
          className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-all ${
            options.fallPico 
              ? 'border-[#B08D55] bg-[#B08D55]/5' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => toggleOption('fallPico')}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
              options.fallPico ? 'bg-[#B08D55] border-[#B08D55]' : 'border-gray-300'
            }`}>
              {options.fallPico && <Check size={12} className="text-white" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Add Fall & Pico</span>
              <span className="text-[10px] text-gray-500">Saree edge finishing</span>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-900">+ ₹150</span>
        </div>

        {/* Option 2: Blouse Stitching */}
        <div 
          className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-all ${
            options.blouseStitching 
              ? 'border-[#B08D55] bg-[#B08D55]/5' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => toggleOption('blouseStitching')}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
              options.blouseStitching ? 'bg-[#B08D55] border-[#B08D55]' : 'border-gray-300'
            }`}>
              {options.blouseStitching && <Check size={12} className="text-white" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Custom Blouse Stitching</span>
              <span className="text-[10px] text-gray-500">We will email you for measurements</span>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-900">+ ₹850</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomization;