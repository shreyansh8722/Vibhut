import React, { useState } from 'react';
import { Truck } from 'lucide-react';

const DeliveryChecker = () => {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState(null);

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setStatus('available');
    } else {
      setStatus('invalid');
    }
  };

  return (
    <div className="py-6 border-t border-gray-100">
       <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
         <Truck size={14} /> Delivery Options
       </h4>
       <div className="flex gap-2 mb-2">
         <input 
            type="text" 
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-48 focus:outline-none focus:border-[#B08D55]"
            maxLength={6}
         />
         <button 
            onClick={checkDelivery}
            className="text-[#B08D55] font-bold text-sm px-2 hover:underline"
         >
            Check
         </button>
       </div>
       
       {status === 'available' && (
         <p className="text-xs text-green-600 font-medium">Delivery available by {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toDateString()}</p>
       )}
       {status === 'invalid' && (
         <p className="text-xs text-red-500">Please enter a valid 6-digit pincode.</p>
       )}
    </div>
  );
};

export default DeliveryChecker;