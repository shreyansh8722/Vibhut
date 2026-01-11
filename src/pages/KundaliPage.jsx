import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Loader2, Sparkles, ArrowRight, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RASHI_MAPPING } from '../data/rashiMapping';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/shop/ProductCard';

// Replace with your actual Firebase/Backend URL
const FIREBASE_PROJECT_ID = "vishwanatham-739fe"; 
const API_URL = `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/getHoroscope`;

const KundaliPage = () => {
  const { products } = useProducts();
  const navigate = useNavigate();
  
  // Steps: 1=Form, 2=Payment, 3=Result
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ dob: '', time: '', city: '' });
  const [result, setResult] = useState(null);

  // --- HANDLER: SUBMIT FORM ---
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.dob || !formData.time || !formData.city) return;
    setLoading(true);
    
    // Simulate brief processing time before showing Payment Screen
    setTimeout(() => {
        setLoading(false);
        setStep(2); // Move to Payment
    }, 1000);
  };

  // --- HANDLER: PROCESS PAYMENT (MOCKED) ---
  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. INTEGRATE PAYMENT GATEWAY HERE (Razorpay/PhonePe)
      // Example: await razorpay.open({ amount: 9900 ... })
      
      // 2. FETCH DATA AFTER PAYMENT SUCCESS
      // For now, we mock the API call logic:
      const datetime = `${formData.dob}T${formData.time}:00+05:30`;
      const coordinates = "25.3176,82.9739"; // Defaulting to Varanasi (In prod, use Geocoding API)

      // const response = await fetch(API_URL, ...); 
      // const data = await response.json();
      
      // MOCK RESULT FOR DEMO (Replace with actual API response):
      const mockSign = "Leo"; 
      
      setTimeout(() => {
          setResult(mockSign);
          setStep(3); // Move to Result
          setLoading(false);
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("Payment failed or API error.");
      setLoading(false);
    }
  };

  // --- RECOMMENDATION LOGIC ---
  const recommendedProducts = useMemo(() => {
    if (!result || !products) return [];
    const mapping = RASHI_MAPPING[result];
    if (!mapping) return [];

    // Find products matching Rashi keywords
    return products.filter(product => {
        const text = (product.name + " " + product.description + " " + product.category).toLowerCase();
        return mapping.keywords.some(k => text.includes(k.toLowerCase()));
    }).slice(0, 4); 
  }, [result, products]);

  return (
    <div className="min-h-screen bg-[#FFFBF0] font-sans pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-[#1F362A] text-white pt-12 pb-32 relative overflow-hidden rounded-b-[3rem]">
         <div className="container mx-auto px-4 text-center relative z-10">
            <span className="text-[#B08D55] font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-pulse">
               Vedic Science
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
               Premium Kundali Report
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto text-sm leading-relaxed">
               Get your detailed Rashi calculation and personalized spiritual remedies from the pundits of Kashi.
            </p>
         </div>
         {/* Background Decor */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 text-6xl">🕉️</div>
            <div className="absolute bottom-10 right-10 text-6xl">✨</div>
         </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        
        {/* --- STEP 1: INPUT FORM --- */}
        {step === 1 && (
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-[#B08D55]/20 animate-in slide-in-from-bottom-4">
               <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                  <h2 className="font-serif text-2xl font-bold text-[#1F362A]">Enter Birth Details</h2>
                  <div className="bg-[#FFFBF0] text-[#B08D55] text-xs font-bold px-3 py-1 rounded-full border border-[#B08D55]/30">
                     Step 1 of 2
                  </div>
               </div>

               <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Date of Birth</label>
                        <input 
                           required type="date" 
                           className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-[#B08D55] outline-none transition-colors" 
                           onChange={e => setFormData({...formData, dob: e.target.value})} 
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Time of Birth</label>
                        <input 
                           required type="time" 
                           className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-[#B08D55] outline-none transition-colors" 
                           onChange={e => setFormData({...formData, time: e.target.value})} 
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Place of Birth</label>
                     <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 px-3 focus-within:border-[#B08D55] focus-within:bg-white transition-colors">
                        <MapPin size={18} className="text-gray-400" />
                        <input 
                           required type="text" 
                           placeholder="e.g. Varanasi, Mumbai" 
                           className="w-full p-3 bg-transparent outline-none" 
                           onChange={e => setFormData({...formData, city: e.target.value})} 
                        />
                     </div>
                  </div>

                  <button 
                     disabled={loading} 
                     className="w-full py-4 bg-[#B08D55] text-white font-bold rounded-lg shadow-lg hover:bg-[#967645] transition-all flex justify-center items-center gap-2"
                  >
                     {loading ? <Loader2 className="animate-spin" /> : <>Proceed to Summary <ArrowRight size={18}/></>}
                  </button>
               </form>
            </div>
        )}

        {/* --- STEP 2: PAYMENT SCREEN --- */}
        {step === 2 && (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-right-4">
               {/* Order Summary Header */}
               <div className="bg-gray-50 p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                     <h3 className="font-serif text-xl font-bold text-gray-900">Order Summary</h3>
                     <button onClick={() => setStep(1)} className="text-xs text-[#B08D55] font-bold underline">Edit Details</button>
                  </div>
                  <p className="text-xs text-gray-500">Completing your request for {formData.city}</p>
               </div>

               {/* Bill Details */}
               <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                     <span>Vedic Kundali Analysis</span>
                     <span className="font-medium">₹299</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-green-600">
                     <span>Instant Discount</span>
                     <span className="font-medium">-₹200</span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 my-2 pt-3 flex justify-between items-center text-lg font-bold text-[#1F362A]">
                     <span>Total To Pay</span>
                     <span>₹99</span>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                     <div className="flex items-center gap-2 text-[10px] bg-green-50 text-green-700 p-2 rounded border border-green-100 font-bold">
                        <Lock size={12} /> Secure Payment
                     </div>
                     <div className="flex items-center gap-2 text-[10px] bg-blue-50 text-blue-700 p-2 rounded border border-blue-100 font-bold">
                        <ShieldCheck size={12} /> Verified Pundits
                     </div>
                  </div>
               </div>

               {/* Pay Button */}
               <div className="p-6 pt-0">
                  <button 
                     onClick={handlePayment}
                     disabled={loading}
                     className="w-full py-4 bg-[#1F362A] text-white font-bold rounded-lg shadow-xl hover:bg-black transition-all flex justify-center items-center gap-2 relative overflow-hidden group"
                  >
                     {loading ? (
                        <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Processing...</span>
                     ) : (
                        <>
                           Pay ₹99 & Reveal Report <Sparkles size={16} className="text-[#B08D55]" />
                        </>
                     )}
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-3">
                     By continuing, you agree to our Terms of Service.
                  </p>
               </div>
            </div>
        )}

        {/* --- STEP 3: RESULTS & UPSELL --- */}
        {step === 3 && result && (
            <div className="animate-in fade-in duration-700">
               
               {/* Success Banner */}
               <div className="max-w-2xl mx-auto mb-6 flex items-center gap-2 bg-green-100 text-green-800 px-4 py-3 rounded-lg border border-green-200 shadow-sm">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-wide">Payment Successful • Report Generated</span>
               </div>

               {/* A. The Rashi Card */}
               <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-[#E6D5B8]">
                  <div className="bg-[#1F362A] p-8 text-center text-white relative">
                     <div className="absolute top-4 right-4 text-[#B08D55]/20 animate-spin-slow">
                        <Sparkles size={100} />
                     </div>
                     <p className="text-xs uppercase tracking-widest opacity-80 mb-2">Based on your birth chart</p>
                     <h2 className="text-5xl font-serif font-bold text-[#F4EBD9] mb-2">{result}</h2>
                     <p className="text-[#B08D55] font-bold text-lg uppercase tracking-wider">{RASHI_MAPPING[result]?.indianName}</p>
                  </div>
                  
                  <div className="p-8 text-center">
                     <p className="text-gray-600 italic text-lg leading-relaxed mb-8">
                        "{RASHI_MAPPING[result]?.description}"
                     </p>
                     
                     <div className="grid grid-cols-2 gap-4 text-left bg-[#FFFBF0] p-6 rounded-xl border border-[#F4EBD9]">
                        <div>
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ruling Planet</span>
                           <p className="font-bold text-xl text-[#1F362A] mt-1">{RASHI_MAPPING[result]?.planet}</p>
                        </div>
                        <div>
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lucky Element</span>
                           <p className="font-bold text-xl text-[#1F362A] mt-1">{RASHI_MAPPING[result]?.element}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* B. PRODUCT RECOMMENDATIONS (The Upsell) */}
               <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                     <h3 className="font-serif text-3xl font-bold text-[#1F362A] mb-3">
                        Recommended Artifacts
                     </h3>
                     <p className="text-gray-500 max-w-2xl mx-auto text-sm">
                        Our astrologers have selected these specific items to enhance the positive effects of your <span className="font-bold text-[#B08D55]">{result}</span> Rashi.
                     </p>
                  </div>

                  {recommendedProducts.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {recommendedProducts.map(product => (
                           <ProductCard key={product.id} product={product} />
                        ))}
                     </div>
                  ) : (
                     <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">Loading personalized recommendations...</p>
                     </div>
                  )}

                  <div className="mt-16 text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
                     <h4 className="font-serif text-xl font-bold text-gray-900 mb-2">Have specific questions?</h4>
                     <p className="text-sm text-gray-500 mb-6">Your chart shows unique planetary alignments. Speak to an expert for a deep dive.</p>
                     <Link to="/consult" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1F362A] text-white font-bold rounded-full hover:bg-black transition-all shadow-lg hover:-translate-y-1">
                        Talk to Astrologer <ArrowRight size={18} />
                     </Link>
                  </div>
               </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default KundaliPage;