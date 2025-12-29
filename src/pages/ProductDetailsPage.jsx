import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Loader2, Truck, CheckCircle2, 
  Ticket, ChevronDown, Eye, Package, Info, ArrowRight, Minus, Plus,
  Phone, Share2, Sparkles, Moon, Zap, ShieldCheck
} from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProducts } from '../context/ProductContext';
import { RASHI_MAPPING } from '../data/rashiMapping';
import ProductGallery from '../components/shop/ProductGallery';
import { ProductReviews } from '../components/shop/ProductReviews'; 
import RashiFinderModal from '../components/shop/RashiFinderModal';

// Custom Om Icon
const OmIcon = () => (
  <span className="text-lg leading-none font-serif">🕉️</span>
);

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data State
  const { products, loading: staticLoading } = useProducts();
  const [realStock, setRealStock] = useState(null);
  const [isStockLoading, setIsStockLoading] = useState(true);
  const [coupons, setCoupons] = useState([]); 
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  
  // UI State
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [openSections, setOpenSections] = useState({ details: true, shipping: false });
  const [addEnergization, setAddEnergization] = useState(false);
  const [devoteeName, setDevoteeName] = useState('');
  const [suitableRashis, setSuitableRashis] = useState([]);
  const [isRashiModalOpen, setIsRashiModalOpen] = useState(false);
  
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [viewCount, setViewCount] = useState(112);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [orderTimer, setOrderTimer] = useState({ m: 14, s: 59 });

  const mainActionsRef = useRef(null);
  const ENERGIZATION_COST = 151;

  const product = products.find(p => String(p.id) === id);
  const recommendations = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const galleryImages = product ? (product.imageUrls || [product.featuredImageUrl]) : [];

  // Dynamic Discount
  const getDiscountPercent = (qty) => {
    if (qty >= 3) return 15;
    if (qty === 2) return 10; 
    return 0;
  };

  // 1. Live Reviews
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'reviews'), where('spotId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => doc.data());
      setReviews(fetchedReviews);
      if (fetchedReviews.length > 0) {
        const total = fetchedReviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
        setAverageRating(Math.round((total / fetchedReviews.length) * 10) / 10); 
      }
    });
    return () => unsubscribe();
  }, [id]);

  // 2. Fetch Stock & Rashi
  useEffect(() => {
    const fetchLiveData = async () => {
      if (!id || !product) return;
      setIsStockLoading(true);
      
      const matches = [];
      if (RASHI_MAPPING) {
        Object.keys(RASHI_MAPPING).forEach(rashi => {
          const mapping = RASHI_MAPPING[rashi];
          const keywords = mapping.keywords || [];
          const textToCheck = (product.name + " " + product.description + " " + product.category).toLowerCase();
          
          if (keywords.some(k => textToCheck.includes(k.toLowerCase()))) {
              matches.push({ name: rashi, ...mapping });
          }
        });
        setSuitableRashis(matches);
      }

      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        setRealStock(docSnap.exists() ? docSnap.data().stock : (product?.stock || 50));
        
        const couponsSnap = await getDocs(collection(db, 'coupons'));
        setCoupons(couponsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.isActive !== false));
      } catch (error) {
        setRealStock(product?.stock || 50);
      } finally {
        setIsStockLoading(false);
      }
    };
    fetchLiveData();
  }, [id, product]);

  // 3. Timers
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0.1 });
    if (mainActionsRef.current) observer.observe(mainActionsRef.current);
    const viewInterval = setInterval(() => setViewCount(prev => prev + (Math.random() > 0.5 ? 1 : -1)), 5000);
    const timerInterval = setInterval(() => setOrderTimer(prev => prev.s === 0 ? { m: prev.m - 1, s: 59 } : { ...prev, s: prev.s - 1 }), 1000);
    return () => { 
      if (mainActionsRef.current) observer.unobserve(mainActionsRef.current);
      clearInterval(viewInterval); 
      clearInterval(timerInterval); 
    };
  }, []);

  if (staticLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#B08D55]" size={40} /></div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found</div>;

  const basePrice = Number(product.price);
  const comparePrice = Number(product.comparePrice);
  const discountPercent = getDiscountPercent(quantity);
  const pricePerUnit = basePrice - (basePrice * (discountPercent / 100));
  const totalPrice = (pricePerUnit * quantity) + (addEnergization ? ENERGIZATION_COST : 0);
  const isOutOfStock = !isStockLoading && realStock !== null && realStock < quantity;

  const handleDirectOrder = (paymentMode) => {
    const directItem = {
      id: product.id,
      name: product.name,
      price: pricePerUnit,
      quantity: quantity,
      variant: quantity === 1 ? 'Single' : `Bundle (${quantity})`,
      image: galleryImages[0],
      energization: addEnergization,
      energizationDetails: addEnergization ? { name: devoteeName } : null
    };
    navigate('/checkout', { state: { directPurchase: [directItem], paymentMode } });
  };

  const checkDelivery = () => {
    if (pincode.length !== 6) return;
    setTimeout(() => {
      const date = new Date();
      date.setDate(date.getDate() + 4);
      setDeliveryDate(date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }));
    }, 1000);
  };

  return (
    <>
      <style>{`
        @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shine { animation: shine 1.5s infinite linear; }
        .font-crimson { font-family: 'Crimson Pro', serif; }
        @keyframes glow-gold { 0% { box-shadow: 0 0 5px #B08D55; } 50% { box-shadow: 0 0 20px #B08D55, 0 0 10px #F4EBD9; } 100% { box-shadow: 0 0 5px #B08D55; } }
        .animate-glow { animation: glow-gold 2s infinite; }
      `}</style>
      
      <RashiFinderModal 
         isOpen={isRashiModalOpen} 
         onClose={() => setIsRashiModalOpen(false)}
         onRashiSelected={(rashi) => {
            setIsRashiModalOpen(false);
            navigate(`/shop?rashi=${rashi}`);
         }}
      />

      <div className="bg-white min-h-screen pb-32 font-sans text-gray-900">
        
        {/* Breadcrumb */}
        <div className="hidden md:block bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Link to="/" className="hover:text-[#B08D55] transition-colors">Home</Link> <ChevronRight size={10} />
              <Link to="/shop" className="hover:text-[#B08D55] transition-colors">Shop</Link> <ChevronRight size={10} />
              <span className="text-gray-900 font-bold truncate max-w-[200px]">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 pt-0 md:pt-6">
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-12">
            
            {/* Gallery */}
            <div className="w-full lg:w-[58%]">
               <ProductGallery images={galleryImages} />
               
               {/* TRUST BADGES (Restored Colorful Version) */}
               <div className="hidden lg:grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 p-4 bg-[#FFFBF0] rounded-xl border border-[#F4EBD9]">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#B08D55] shadow-sm">
                         <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs uppercase text-[#B08D55]">Lab Certified</h5>
                        <p className="text-[10px] text-gray-600">100% Authentic</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#F2FDF4] rounded-xl border border-green-100">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                         <Zap size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs uppercase text-green-700">Energized</h5>
                        <p className="text-[10px] text-gray-600">Prana Pratishtha</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm">
                         <Truck size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs uppercase text-gray-700">Insured</h5>
                        <p className="text-[10px] text-gray-600">Safe Delivery</p>
                      </div>
                  </div>
               </div>
            </div>

            {/* Buy Box */}
            <div className="w-full lg:w-[42%] mt-4 lg:mt-0">
              
              {/* Product Title & Header */}
              <div className="mb-5 border-b border-gray-100 pb-5">
                  <div className="flex items-center justify-between mb-2">
                     <span className="bg-[#1F362A] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} className="text-[#B08D55]" /> Premium Collection
                     </span>
                     <button className="text-gray-400 hover:text-[#B08D55] transition-colors">
                        <Share2 size={18} />
                     </button>
                  </div>
                  
                  {/* FONT CHANGE: Crimson Pro (font-serif) + Black Color */}
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-black mb-2 leading-tight">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1 text-[#B08D55]">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-bold text-gray-900 ml-1">
                          {averageRating || 4.8} <span className="text-gray-400 font-normal">({reviews.length || 124} Reviews)</span>
                        </span>
                     </div>
                     <span className="text-[11px] text-[#B08D55] font-bold flex items-center gap-1 bg-[#FFFBF0] px-2 py-1 rounded-full">
                        <Eye size={12} /> {viewCount} people viewing
                     </span>
                  </div>
              </div>

              {/* ✨ ASTRO RECOMMENDATION (Aesthetic & Catchy) */}
              <div className="flex flex-col gap-3 mb-6">
                {suitableRashis.length > 0 ? (
                  <div className="relative overflow-hidden bg-gradient-to-r from-[#FFFBF0] to-white border border-[#E6D5B8] rounded-xl p-4 shadow-sm group hover:shadow-md transition-all">
                     <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Moon size={60} className="text-[#B08D55]" />
                     </div>
                     
                     <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#B08D55] to-[#967645] text-white rounded-full flex items-center justify-center shadow-lg">
                           <Moon size={18} fill="currentColor" />
                        </div>
                        <div>
                           <p className="text-[10px] text-[#B08D55] uppercase font-bold tracking-widest mb-0.5">Perfect Match For</p>
                           <p className="text-base font-serif font-bold text-[#1F362A]">
                              {suitableRashis.map(r => r.name).join(' & ')}
                           </p>
                        </div>
                     </div>
                  </div>
                ) : (
                   /* Fallback generic text if no rashi found */
                   <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                      <Sparkles className="text-gray-400" size={16} />
                      <p className="text-xs text-gray-500">Universal benefits for all Rashis.</p>
                   </div>
                )}
                
                {/* 🔮 CLICKABLE RASHI FINDER (Pulsing Effect) */}
                <button 
                  onClick={() => setIsRashiModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-[#1F362A] via-[#2E4F3E] to-[#1F362A] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                   {/* Shimmer effect overlay */}
                   <div className="absolute inset-0 w-full h-full overflow-hidden opacity-20">
                      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-20deg] animate-shine"></div>
                   </div>
                   <Sparkles size={14} className="group-hover:animate-spin" /> 
                   Get Personalised Recommendations
                </button>
              </div>

              {/* Price (Black & Serif) */}
              <div className="mb-5">
                 <div className="flex items-end gap-3 mb-1">
                    <span className="text-4xl font-serif font-bold text-black">₹{totalPrice.toLocaleString()}</span>
                    {comparePrice > 0 && (
                      <>
                        <span className="text-lg text-gray-400 line-through mb-1.5 font-light">₹{(comparePrice * quantity).toLocaleString()}</span>
                        <span className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded mb-2 shadow-sm">
                           -{Math.round(((comparePrice - pricePerUnit) / comparePrice) * 100)}%
                        </span>
                      </>
                    )}
                 </div>
                 <p className="text-[11px] text-gray-500 font-medium">Inclusive of all taxes & free shipping.</p>
              </div>

              {/* Quantity */}
              <div className="mb-5 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-xs font-bold text-gray-900 uppercase">Select Quantity</span>
                   {discountPercent > 0 && (
                     <span className="text-xs font-bold text-[#B08D55] bg-[#FFFBF0] px-2 py-0.5 rounded border border-[#F4EBD9]">
                       {discountPercent}% Bundle Savings
                     </span>
                   )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-lg h-10 w-32 border border-gray-200">
                    <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="w-10 h-full flex items-center justify-center hover:bg-white hover:text-[#B08D55] rounded-l-lg transition-colors"><Minus size={16} /></button>
                    <div className="flex-1 h-full flex items-center justify-center font-bold text-black font-serif text-lg">{quantity}</div>
                    <button onClick={() => !isOutOfStock && setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center hover:bg-white hover:text-[#B08D55] rounded-r-lg transition-colors"><Plus size={16} /></button>
                  </div>
                  {quantity === 1 && (
                     <p className="text-xs text-[#B08D55] font-bold underline decoration-dotted cursor-pointer hover:text-[#967645]" onClick={() => setQuantity(2)}>
                        Buy 2 & Save 10%
                     </p>
                  )}
                </div>
              </div>

              {/* ⚡ ENERGIZATION (Glow Effect) */}
              <div 
                 onClick={() => setAddEnergization(!addEnergization)}
                 className={`mb-6 border-2 rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden group
                    ${addEnergization 
                       ? 'border-[#B08D55] bg-[#FFFBF0] shadow-[0_0_15px_rgba(176,141,85,0.3)]' 
                       : 'border-dashed border-gray-300 bg-white hover:border-[#B08D55] hover:bg-gray-50'}`}
              >
                 <div className="flex items-start gap-3 relative z-10">
                    <div className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center transition-all 
                       ${addEnergization ? 'bg-[#B08D55] border-[#B08D55] text-white' : 'border-gray-300 bg-white'}`}>
                       {addEnergization && <CheckCircle2 size={16} />}
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-[#1F362A] flex items-center gap-2">
                          Add Pran Pratistha (Energization)
                          <span className="bg-[#B08D55] text-white text-[9px] px-1.5 py-0.5 rounded uppercase shadow-sm animate-pulse">
                             Recommended
                          </span>
                       </p>
                       <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Vedic ritual performed in your name at Kashi Vishwanath temple to activate the spiritual energy. (+₹{ENERGIZATION_COST})
                       </p>
                       
                       {addEnergization && (
                          <div className="mt-3 animate-fade-in">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Name for Sankalp</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Rahul Sharma" 
                                className="w-full mt-1 text-sm p-2 bg-white border border-[#E6D5B8] rounded outline-none focus:border-[#B08D55] shadow-inner font-serif"
                                value={devoteeName}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setDevoteeName(e.target.value)}
                            />
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Main Actions */}
              <div ref={mainActionsRef} className="flex flex-col gap-3 mb-6">
                 <button 
                    onClick={() => handleDirectOrder('ONLINE')}
                    disabled={isOutOfStock}
                    className={`w-full py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 group relative overflow-hidden transition-all hover:scale-[1.01]
                    ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}
                 >
                    {isOutOfStock ? "Sold Out" : (
                      <>
                        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30">
                           <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-20deg] animate-shine"></div>
                        </div>
                        <span className="font-bold text-sm uppercase tracking-widest relative z-10 flex items-center gap-2 text-[#F4EBD9]">
                           Pay Online <ArrowRight size={16} />
                        </span>
                      </>
                    )}
                 </button>

                 <button 
                    onClick={() => handleDirectOrder('COD')}
                    disabled={isOutOfStock}
                    className="w-full py-3.5 border border-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-900 hover:border-black hover:bg-gray-50 transition-colors"
                 >
                    Cash on Delivery
                 </button>
              </div>

              {/* Delivery & Accordions */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                 <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Truck size={12} /> Check Delivery
                 </h5>
                 <div className="flex gap-2">
                    <input 
                       type="text" maxLength={6} placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} 
                       className="flex-1 h-10 px-3 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#B08D55] bg-white" 
                    />
                    <button onClick={checkDelivery} className="px-4 bg-black text-white rounded-lg text-xs font-bold uppercase hover:bg-[#B08D55] transition-colors">
                       Check
                    </button>
                 </div>
                 {deliveryDate && <p className="text-xs text-green-700 mt-2 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Estimated: {deliveryDate}</p>}
              </div>

              <div className="border-t border-gray-100">
                  <div className="border-b border-gray-100">
                     <button onClick={() => setOpenSections(p => ({...p, details: !p.details}))} className="w-full py-4 flex justify-between items-center text-left hover:text-[#B08D55] transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2"><Info size={16} /> Product Details</span>
                        <ChevronDown size={14} className={`transition-transform ${openSections.details ? 'rotate-180' : ''}`} />
                     </button>
                     {openSections.details && (
                        <div className="pb-6 text-sm text-gray-600 leading-relaxed font-serif">
                           <p>{product.description || "Authentic spiritual artifact from Kashi."}</p>
                        </div>
                     )}
                  </div>
              </div>

            </div>
          </div>
          
          <div className="mt-16"><ProductReviews productId={product.id} /></div>

          {/* Sticky Mobile Bar */}
          <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 z-50 transition-transform duration-300 shadow-2xl ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
             <div className="flex gap-3">
               <button onClick={() => handleDirectOrder('COD')} className="flex-1 py-3 bg-white border border-gray-300 text-black text-xs font-bold uppercase rounded-lg">COD</button>
               <button onClick={() => handleDirectOrder('ONLINE')} className="flex-[1.5] py-3 bg-black text-[#F4EBD9] text-xs font-bold uppercase rounded-lg shadow-lg">Pay Online</button>
             </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;