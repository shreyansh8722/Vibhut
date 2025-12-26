import React from 'react';
import { ShieldCheck, Truck, Flame, Award } from 'lucide-react';

const TrustBar = () => {
  const features = [
    { icon: <Flame size={20}/>, title: "Vedic Energization", desc: "100% Prana Pratistha" },
    { icon: <ShieldCheck size={20}/>, title: "Lab Certified", desc: "Guaranteed Authenticity" },
    { icon: <Award size={20}/>, title: "Sourced from Kashi", desc: "Direct from Origin" },
    { icon: <Truck size={20}/>, title: "Pan-India Shipping", desc: "Secure Delivery" },
  ];

  return (
    <div className="bg-white border-b border-gray-100 py-8 relative z-20 -mt-10 mx-4 md:mx-auto max-w-6xl rounded-xl shadow-xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 divide-x divide-gray-100/50">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left group pl-2 first:pl-0">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[var(--color-primary)] border border-orange-100 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <div>
              <h4 className="font-heading font-bold text-black text-sm group-hover:text-[var(--color-primary)] transition-colors">{feature.title}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBar;