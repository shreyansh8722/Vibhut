import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-body text-black">
      <Navbar />

      <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-20 animate-fade-up">
          <span className="text-xs font-bold font-body uppercase tracking-[0.2em] text-[var(--color-primary)] mb-3 block">
            At Your Service
          </span>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-black">
            Get in Touch
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-fade-up">
          
          {/* INFO */}
          <div className="space-y-12">
            <p className="text-lg text-gray-500 font-light leading-relaxed">
              Whether you wish to discuss a bespoke commission, inquire about a shipment, or learn more about our process, our concierge team is at your disposal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-black">
                  <MapPin size={18} className="text-[var(--color-primary)]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Visit Us</span>
                </div>
                <p className="text-sm text-gray-500 leading-loose">
                  B-21/108, Kamachha,<br/>
                  Bhelupur, Varanasi,<br/>
                  Uttar Pradesh 221010
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-black">
                  <Phone size={18} className="text-[var(--color-primary)]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Contact</span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>+91 93054 91919</p>
                  <p>hello@vishwanatham.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="bg-gray-50 p-8 md:p-12 border border-gray-100 shadow-sm rounded-sm">
            <h3 className="font-heading text-2xl mb-8 font-bold">Send a Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">First Name</label>
                  <input type="text" className="w-full border-b border-gray-300 py-2 text-sm focus:border-black outline-none bg-transparent transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Last Name</label>
                  <input type="text" className="w-full border-b border-gray-300 py-2 text-sm focus:border-black outline-none bg-transparent transition-colors" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Email</label>
                <input type="email" className="w-full border-b border-gray-300 py-2 text-sm focus:border-black outline-none bg-transparent transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Message</label>
                <textarea rows="4" className="w-full border-b border-gray-300 py-2 text-sm focus:border-black outline-none bg-transparent transition-colors"></textarea>
              </div>

              <button className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--color-primary)] transition-colors shadow-lg">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}