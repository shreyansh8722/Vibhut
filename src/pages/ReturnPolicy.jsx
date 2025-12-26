import React from 'react';
import { SEO } from '../components/SEO';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const ReturnPolicy = () => {
  return (
    <div className="bg-white min-h-screen pt-24 pb-20 font-body text-black">
      <SEO title="Return & Refund Policy" />
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="font-heading text-4xl font-bold text-black text-center mb-12">Return & Refund Policy</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 border border-gray-200 text-center rounded-lg shadow-sm hover:border-black transition-colors">
            <RefreshCw className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
            <h3 className="font-bold text-black mb-2">7-Day Returns</h3>
            <p className="text-xs text-gray-500">Easy returns within 7 days of delivery.</p>
          </div>
          <div className="bg-white p-6 border border-gray-200 text-center rounded-lg shadow-sm hover:border-black transition-colors">
            <AlertTriangle className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
            <h3 className="font-bold text-black mb-2">Damaged Items</h3>
            <p className="text-xs text-gray-500">Instant replacement for damaged goods.</p>
          </div>
          <div className="bg-white p-6 border border-gray-200 text-center rounded-lg shadow-sm hover:border-black transition-colors">
            <CheckCircle className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
            <h3 className="font-bold text-black mb-2">Authenticity</h3>
            <p className="text-xs text-gray-500">100% money back if not authentic.</p>
          </div>
        </div>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
          <div className="bg-gray-50 p-8 border-l-4 border-black rounded-r-lg">
            <h3 className="font-heading text-xl font-bold text-black mb-3">Eligibility for Returns</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your item must be unused and in the same condition that you received it.</li>
              <li>It must be in the original packaging.</li>
              <li>To complete your return, we require a receipt or proof of purchase.</li>
              <li>Rudraksha beads must not have been worn or energized by the customer.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-xl font-bold text-black mb-3">Non-returnable items</h3>
            <p>Perishable goods such as Prasad, flowers, or certain oils cannot be returned. We also do not accept products that are intimate or sanitary goods, hazardous materials, or flammable liquids or gases.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;