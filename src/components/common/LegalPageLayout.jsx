import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SEO } from '../SEO';

export const LegalPageLayout = ({ title, lastUpdated, children }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-brand-dark">
      <SEO title={title} />
      {/* Pass dummy props or real cart state if available */}
      <Navbar cartCount={0} onOpenCart={() => {}} />
      
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mb-12 uppercase tracking-widest">Last Updated: {lastUpdated}</p>
        
        <div className="prose prose-sm md:prose-base prose-headings:font-serif prose-headings:font-normal prose-a:text-[#B08D55] max-w-none text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
};