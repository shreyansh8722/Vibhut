import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Package, Search, CheckCircle2, Clock, Truck } from 'lucide-react';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    // Simulate API Delay
    setTimeout(() => {
       setStatus({
          id: orderId,
          currentStep: 2,
          steps: [
             { title: "Order Placed", date: "Oct 24, 10:00 AM", completed: true, icon: Package },
             { title: "Energization (Pooja)", date: "Oct 25, 08:00 AM", completed: true, icon: CheckCircle2 },
             { title: "Dispatched", date: "Expected Today", completed: false, icon: Truck },
             { title: "Delivered", date: "---", completed: false, icon: Package }
          ]
       });
       setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-white min-h-screen pb-20 font-body text-black">
      <PageHeader title="Track Order" />
      
      <div className="container mx-auto px-4 pt-24 max-w-xl">
         
         <div className="text-center mb-12 animate-fade-in">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
               <Package size={32} className="text-[var(--color-primary)]" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-black mb-2">Where is my order?</h1>
            <p className="text-gray-500 text-sm">Enter the Order ID sent to your WhatsApp.</p>
         </div>

         <form onSubmit={handleTrack} className="flex gap-2 mb-12 shadow-xl rounded-full p-1.5 bg-white border border-gray-200 focus-within:border-black transition-colors">
            <input 
              type="text" 
              placeholder="e.g. VSN-8293"
              className="flex-1 pl-6 pr-4 py-3 bg-transparent outline-none font-bold text-black placeholder:font-normal placeholder:text-gray-400"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <button className="bg-black text-white px-8 rounded-full font-bold text-sm hover:bg-[var(--color-primary)] transition-colors flex items-center gap-2 uppercase tracking-wider">
               {loading ? '...' : <><Search size={16}/> Track</>}
            </button>
         </form>

         {status && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg animate-fade-in">
               <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-4">
                  <div>
                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">Order ID</span>
                     <span className="font-heading font-bold text-xl text-black">#{status.id}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                     <Clock size={12} /> In Transit
                  </span>
               </div>

               <div className="relative space-y-0">
                  {/* Vertical Line */}
                  <div className="absolute left-[19px] top-2 bottom-10 w-0.5 bg-gray-200"></div>

                  {status.steps.map((step, idx) => (
                     <div key={idx} className="relative pl-12 pb-10 last:pb-0 group">
                        {/* Status Icon */}
                        <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors duration-500 ${
                           step.completed 
                              ? 'bg-black text-white' 
                              : idx === status.currentStep 
                                 ? 'bg-[var(--color-primary)] text-white animate-pulse' 
                                 : 'bg-gray-200 text-white'
                        }`}>
                           <CheckCircle2 size={16} />
                        </div>
                        
                        <div>
                           <h4 className={`font-bold text-sm uppercase tracking-wide transition-colors ${step.completed || idx === status.currentStep ? 'text-black' : 'text-gray-400'}`}>
                              {step.title}
                           </h4>
                           <p className="text-[10px] text-gray-500 mt-1 font-bold bg-gray-50 inline-block px-2 py-0.5 rounded border border-gray-100">
                              {step.date}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

      </div>
    </div>
  );
};

export default TrackOrderPage;