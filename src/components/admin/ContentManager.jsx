import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Quote, HelpCircle, Plus, Trash2, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/utils';

export const ContentManager = () => {
  const [activeTab, setActiveTab] = useState('testimonials');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);

  // Form States
  const [reviewForm, setReviewForm] = useState({ name: '', role: '', text: '', rating: 5, image: '' });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General' });
  const [reviewImage, setReviewImage] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubTesti = onSnapshot(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')), (snap) => {
      setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubFaq = onSnapshot(query(collection(db, 'faqs'), orderBy('createdAt', 'desc')), (snap) => {
      setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => { unsubTesti(); unsubFaq(); };
  }, []);

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      let url = "";
      if (reviewImage) {
        const compressed = await compressImage(reviewImage);
        const storageRef = ref(storage, `content/testimonials/${Date.now()}_${reviewImage.name}`);
        await uploadBytes(storageRef, compressed);
        url = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'testimonials'), {
        ...reviewForm,
        image: url,
        createdAt: serverTimestamp()
      });
      setReviewForm({ name: '', role: '', text: '', rating: 5, image: '' });
      setReviewImage(null);
      alert("Testimonial added!");
    } catch (err) { console.error(err); alert("Failed to add testimonial"); }
    finally { setProcessing(false); }
  };

  const handleAddFAQ = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await addDoc(collection(db, 'faqs'), {
        ...faqForm,
        createdAt: serverTimestamp()
      });
      setFaqForm({ question: '', answer: '', category: 'General' });
      alert("FAQ added!");
    } catch (err) { console.error(err); alert("Failed to add FAQ"); }
    finally { setProcessing(false); }
  };

  const handleDelete = async (collectionName, id) => {
    if (window.confirm("Delete this item?")) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading content...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-8">
        <button onClick={() => setActiveTab('testimonials')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'testimonials' ? 'border-b-2 border-[#B08D55] text-[#B08D55]' : 'text-gray-400 hover:text-gray-600'}`}>
          <Quote size={18} /> Testimonials
        </button>
        <button onClick={() => setActiveTab('faqs')} className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'faqs' ? 'border-b-2 border-[#B08D55] text-[#B08D55]' : 'text-gray-400 hover:text-gray-600'}`}>
          <HelpCircle size={18} /> FAQs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- TESTIMONIALS TAB --- */}
        {activeTab === 'testimonials' && (
          <>
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                <h3 className="font-bold text-gray-900 mb-4">Add Testimonial</h3>
                <form onSubmit={handleAddTestimonial} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden border border-gray-200 relative group cursor-pointer">
                       <img src={reviewImage ? URL.createObjectURL(reviewImage) : "https://placehold.co/100?text=User"} className="w-full h-full object-cover" />
                       <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setReviewImage(e.target.files[0])} />
                    </div>
                    <div className="flex-1">
                       <label className="block text-[10px] font-bold text-gray-500 uppercase">Customer Photo</label>
                       <span className="text-xs text-gray-400">Click to upload</span>
                    </div>
                  </div>
                  <input required placeholder="Customer Name" className="w-full border p-2.5 rounded-lg text-sm outline-none focus:border-[#B08D55]" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} />
                  <input placeholder="Location / Role (e.g. Mumbai)" className="w-full border p-2.5 rounded-lg text-sm outline-none focus:border-[#B08D55]" value={reviewForm.role} onChange={e => setReviewForm({...reviewForm, role: e.target.value})} />
                  <textarea required rows="3" placeholder="Their review..." className="w-full border p-2.5 rounded-lg text-sm outline-none focus:border-[#B08D55]" value={reviewForm.text} onChange={e => setReviewForm({...reviewForm, text: e.target.value})} />
                  <button disabled={processing} className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors">
                    {processing ? <Loader2 className="animate-spin mx-auto"/> : 'Add Review'}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-4">
               {testimonials.map(item => (
                 <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 group">
                    <img src={item.image || "https://placehold.co/100"} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                    <div className="flex-1">
                       <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                       <p className="text-xs text-gray-400 mb-2">{item.role}</p>
                       <p className="text-sm text-gray-600 italic">"{item.text}"</p>
                    </div>
                    <button onClick={() => handleDelete('testimonials', item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                 </div>
               ))}
            </div>
          </>
        )}

        {/* --- FAQ TAB --- */}
        {activeTab === 'faqs' && (
          <>
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                <h3 className="font-bold text-gray-900 mb-4">Add FAQ</h3>
                <form onSubmit={handleAddFAQ} className="space-y-4">
                  <select className="w-full border p-2.5 rounded-lg text-sm outline-none bg-white" value={faqForm.category} onChange={e => setFaqForm({...faqForm, category: e.target.value})}>
                     <option>General</option><option>Shipping</option><option>Returns</option><option>Products</option>
                  </select>
                  <input required placeholder="Question" className="w-full border p-2.5 rounded-lg text-sm outline-none focus:border-[#B08D55]" value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} />
                  <textarea required rows="4" placeholder="Answer" className="w-full border p-2.5 rounded-lg text-sm outline-none focus:border-[#B08D55]" value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} />
                  <button disabled={processing} className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors">
                    {processing ? <Loader2 className="animate-spin mx-auto"/> : 'Add FAQ'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
               {faqs.map(item => (
                 <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 group relative">
                    <span className="text-[10px] uppercase font-bold text-[#B08D55] bg-[#B08D55]/10 px-2 py-1 rounded-sm mb-2 inline-block">{item.category}</span>
                    <h4 className="font-bold text-gray-900 mb-2">{item.question}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                    <button onClick={() => handleDelete('faqs', item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                 </div>
               ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};