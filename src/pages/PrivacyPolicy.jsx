import React from 'react';
import { SEO } from '../components/SEO';

const PrivacyPolicy = () => {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20 font-body text-black">
      <SEO title="Privacy Policy" />
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="font-heading text-4xl font-bold text-black text-center mb-4">Privacy Policy</h1>
        <p className="text-center text-gray-500 text-sm mb-12 max-w-2xl mx-auto">
          At Vishwanatham, we respect the sanctity of your personal information just as we respect the traditions of Kashi.
        </p>

        <div className="bg-white p-8 md:p-12 border border-gray-200 space-y-8 text-sm text-gray-600 leading-relaxed rounded-lg shadow-sm">
          <section>
            <h3 className="font-heading text-xl font-bold text-black mb-3">1. Information We Collect</h3>
            <p>When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as your name, address and email address. When you browse our store, we also automatically receive your computer’s internet protocol (IP) address.</p>
          </section>

          <section>
            <h3 className="font-heading text-xl font-bold text-black mb-3">2. Consent</h3>
            <p>How do you get my consent? When you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange for a delivery or return a purchase, we imply that you consent to our collecting it and using it for that specific reason only.</p>
          </section>

          <section>
            <h3 className="font-heading text-xl font-bold text-black mb-3">3. Security</h3>
            <p>To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;