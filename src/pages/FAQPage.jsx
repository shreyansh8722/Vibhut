import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { SEO } from '@/components/SEO';
import { Plus, Minus, Search } from 'lucide-react';
import { AppSkeleton } from '@/components/skeletons/AppSkeleton';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const q = query(collection(db, 'faqs'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchFAQs();
  }, []);

  const filtered = faqs.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) || 
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <AppSkeleton />;

  return (
    <div className="min-h-screen bg-white font-body text-black flex flex-col">
      <SEO title="Help Center - Vishwanatham" description="Frequently Asked Questions about shipping, returns, and products." />
      <Navbar />

      <div className="bg-black text-white py-20 px-4 text-center">
         <h1 className="font-heading text-3xl md:text-5xl mb-6 font-bold">How can we help?</h1>
         <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search for answers..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-full py-3.5 pl-12 pr-6 text-white text-sm placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
            />
         </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 w-full flex-grow">
         {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No questions found matching "{search}".</div>
         ) : (
            <div className="space-y-4">
               {filtered.map((item, idx) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-gray-300">
                     <button 
                       onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                       className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 text-left transition-colors"
                     >
                        <span className="font-bold text-sm md:text-base text-black">{item.question}</span>
                        {openIndex === idx ? <Minus size={18} className="text-[var(--color-primary)]"/> : <Plus size={18} className="text-gray-400"/>}
                     </button>
                     {openIndex === idx && (
                        <div className="p-5 pt-0 bg-white text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                           <div className="pt-4">{item.answer}</div>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         )}
      </div>

      <Footer />
    </div>
  );
}