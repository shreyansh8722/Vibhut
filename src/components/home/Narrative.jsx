import React from 'react';
import { Sparkles } from 'lucide-react';

export const Narrative = () => {
  return (
    <section className="py-24 px-4 bg-white text-center border-t border-gray-100">
      <div className="max-w-3xl mx-auto animate-fade-up">
        <div className="flex justify-center mb-8">
           <div className="p-3 rounded-full bg-orange-50 text-[var(--color-primary)]">
             <Sparkles className="w-6 h-6" />
           </div>
        </div>
        
        <h2 className="font-heading text-3xl md:text-5xl text-black mb-8 leading-tight font-bold">
          We don't just sell beads. <br/>
          <span className="text-[var(--color-primary)]">We deliver blessings.</span>
        </h2>
        
        <div className="space-y-6 font-body text-lg text-gray-500 leading-relaxed font-light">
          <p>
            In the noise of the modern world, finding <strong className="text-black">Sukoon</strong> (Inner Peace) feels impossible. 
            You are constantly running, achieving, and worrying.
          </p>
          <p>
            At Vishwanatham, we believe peace isn't a destination—it's something you carry with you. 
            Every Rudraksha we source is not just a botanical seed; it is a silence amidst the noise, 
            energized on the holy Ghats of Kashi to help you return to your center.
          </p>
        </div>

        <div className="mt-12">
           <p className="font-heading font-bold text-xs tracking-[0.3em] text-black uppercase">
             Your Journey to Peace Begins Here
           </p>
           <div className="w-12 h-1 bg-[var(--color-primary)] mx-auto mt-4 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Narrative;