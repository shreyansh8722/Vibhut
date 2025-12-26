import React from 'react';
import { PageHeader } from '../components/common/PageHeader';

const TermsPage = () => {
  return (
    <div className="bg-white min-h-screen pb-20 font-body text-black">
      <PageHeader title="Terms & Conditions" />

      <div className="container mx-auto px-4 pt-24 max-w-3xl">
         <div className="prose prose-stone max-w-none">
            <h1 className="font-heading text-3xl font-bold text-black mb-6">Terms of Service</h1>
            <p className="text-gray-500 mb-8 font-medium">Last Updated: October 2024</p>
            
            <section className="mb-8">
               <h3 className="font-heading text-xl font-bold text-black mb-3">1. Introduction</h3>
               <p className="text-gray-600 leading-relaxed">
                  Welcome to Vishwanatham. By accessing our website, you agree to these terms. 
                  Our products are spiritual in nature and outcomes may vary based on individual belief and karma.
               </p>
            </section>

            <section className="mb-8">
               <h3 className="font-heading text-xl font-bold text-black mb-3">2. Authenticity Guarantee</h3>
               <p className="text-gray-600 leading-relaxed">
                  We guarantee that all Rudraksha and gemstones sold are natural. However, natural products may have minor surface imperfections which are not defects but proof of authenticity.
               </p>
            </section>
            
            <section className="mb-8">
               <h3 className="font-heading text-xl font-bold text-black mb-3">3. Pricing & Payments</h3>
               <p className="text-gray-600 leading-relaxed">
                  All prices are inclusive of GST. We reserve the right to change prices without notice. 
                  Payment must be received in full before dispatch for prepaid orders.
               </p>
            </section>
         </div>
      </div>
    </div>
  );
};

export default TermsPage;