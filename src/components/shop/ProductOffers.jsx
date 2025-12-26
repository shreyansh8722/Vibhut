import React from 'react';
import { Tag, CreditCard } from 'lucide-react';

const ProductOffers = () => {
  return (
    <div className="mb-6">
      <h4 className="flex items-center gap-2 font-bold text-sm mb-3">
        <Tag size={16} /> Best Offers
      </h4>
      <div className="space-y-2">
        <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-md text-sm">
          <span className="font-bold text-green-700">Flat ₹500 OFF</span> on first purchase. Use Code: <span className="font-mono font-bold bg-gray-200 px-1 rounded">NEW500</span>
        </div>
        <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-md text-sm flex gap-2 items-start">
            <CreditCard size={16} className="mt-0.5 text-blue-600"/>
            <div>
                <span className="font-bold">10% Instant Discount</span> on HDFC Bank Credit Cards.
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOffers;