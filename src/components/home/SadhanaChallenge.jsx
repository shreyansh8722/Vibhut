import React from 'react';
import { useSiteAssets } from '../../hooks/useSiteAssets'; 
import { MessageCircle, Calendar, CheckCircle2 } from 'lucide-react';

const SadhanaChallenge = () => {
  const { getAsset } = useSiteAssets();
  const bgImage = getAsset('sadhana_bg', 'https://placehold.co/1920x800/1a1a1a/FFFFFF?text=Upload+Sadhana+Image+in+Admin');

  return (
    <section className="relative py-24 overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt="Sadhana" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        
        <div className="max-w-3xl mx-auto mb-16">
           <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              21-Day <span className="text-[var(--color-primary)]">Sadhana</span> Challenge
           </h2>
           <p className="text-gray-300 text-lg leading-relaxed font-light">
              Transform your life in just 10 minutes a day. Join our WhatsApp community to receive daily micro-rituals for mental peace and spiritual growth.
           </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
           {[
             { step: "01", title: "Join WhatsApp", desc: "One click to join our private, spam-free announcement group.", icon: MessageCircle },
             { step: "02", title: "Daily Ritual", desc: "Receive one simple task (Mantra/Meditation) every morning at 6 AM.", icon: Calendar },
             { step: "03", title: "Transformation", desc: "Experience tangible peace and focus after completing 21 days.", icon: CheckCircle2 }
           ].map((item, i) => (
             <div key={i} className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group text-left">
                <div className="flex items-center justify-between mb-6">
                   <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                      <item.icon size={24} strokeWidth={1.5} />
                   </div>
                   <span className="text-4xl font-heading font-bold text-white/10">{item.step}</span>
                </div>
                <h4 className="font-bold text-xl text-white mb-2">{item.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>

        <button className="bg-[var(--color-primary)] text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl flex items-center gap-3 mx-auto hover:-translate-y-1">
           <MessageCircle size={20} /> Join Challenge Free
        </button>

      </div>
    </section>
  );
};

export default SadhanaChallenge;