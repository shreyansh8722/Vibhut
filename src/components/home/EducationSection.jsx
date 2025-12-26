import React from 'react';

export const EducationSection = () => (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <div className="w-full md:w-1/2">
           <div className="relative">
             <div className="absolute -inset-4 border-2 border-black/5 rounded-lg transform rotate-2"></div>
             <img 
               src="https://images.unsplash.com/photo-1603038930495-2c26279f6764?q=80&w=1000" 
               alt="Spiritual Practice" 
               className="w-full h-[400px] object-cover rounded-lg shadow-xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
             />
           </div>
        </div>
        <div className="w-full md:w-1/2 text-center md:text-left">
           
           <h2 className="font-heading text-4xl md:text-5xl text-black mb-6 font-bold">
             Why Wear Rudraksha?
           </h2>
           
           <p className="font-body text-gray-500 leading-relaxed mb-8 font-light text-lg">
             Rudraksha beads are not just jewelry; they are a shield. Historically worn by sages for clarity and protection, they are believed to create a cocoon of your own energy, protecting you from negative influences while traveling or meditating.
           </p>
           <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                <h4 className="font-heading text-xl font-bold mb-1 text-black">Clarity</h4>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Sharpens Focus</p>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                <h4 className="font-heading text-xl font-bold mb-1 text-black">Protection</h4>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Against Negativity</p>
              </div>
           </div>
           <button className="bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--color-primary)] transition-all shadow-lg rounded">
             Read More
           </button>
        </div>
      </div>
    </div>
  </section>
);

export default EducationSection;