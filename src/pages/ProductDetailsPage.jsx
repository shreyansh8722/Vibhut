import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Loader2, Truck, CheckCircle2, 
  Ticket, ChevronDown, Share2, ShieldCheck, 
  HelpCircle, Copy, Check, RotateCcw, ArrowRight, 
  Minus, Plus, Info, Lock, Phone
} from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProducts } from '../context/ProductContext';
import { RASHI_MAPPING } from '../data/rashiMapping';
import ProductGallery from '../components/shop/ProductGallery';
import { ProductReviews } from '../components/shop/ProductReviews'; 
import RashiFinderModal from '../components/shop/RashiFinderModal';
import ProductCard from '../components/shop/ProductCard';

// --- BRAND COLORS ---
const COLORS = {
  primary: "#2E4F3E", // Deep Forest Green
  primaryDark: "#1F362A",
  gold: "#C5A059",    // Antique Gold
  goldLight: "#E5C580",
  bg: "#F9FAFB",      // Gray 50
  text: "#111827"     // Gray 900
};

// Standard WhatsApp Icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const RASHI_EMOJIS = {
  "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
  "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
  "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATE ---
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
  const [openSections, setOpenSections] = useState({ details: true, shipping: false, returns: false });
  const [addEnergization, setAddEnergization] = useState(false);
  const [devoteeName, setDevoteeName] = useState('');
  const [suitableRashis, setSuitableRashis] = useState([]);
  const [isRashiModalOpen, setIsRashiModalOpen] = useState(false);
  
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  const mainActionsRef = useRef(null);
  const ENERGIZATION_COST = 151;

  const product = products.find(p => String(p.id) === id);
  const galleryImages = product ? (product.imageUrls || [product.featuredImageUrl]) : [];

  // --- LOGIC ---
  const recommendations = useMemo(() => {
    if (!product || !products) return [];
    const otherProducts = products.filter(p => String(p.id) !== String(product.id));
    const sameCategory = otherProducts.filter(p => p.category === product.category);
    return [...sameCategory, ...otherProducts].slice(0, 4);
  }, [products, product]);

  const getDiscountPercent = (qty) => {
    if (qty >= 3) return 15;
    if (qty === 2) return 10; 
    return 0;
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  // Observer for Sticky Bar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting), 
      { threshold: 0 }
    );
    if (mainActionsRef.current) observer.observe(mainActionsRef.current);
    return () => { if (mainActionsRef.current) observer.unobserve(mainActionsRef.current); };
  }, []);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch (error) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (staticLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#2E4F3E]" size={32} /></div>;
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

  const handleWhatsAppOrder = () => {
    const message = `Namaste! I want to order ${product.name}. Price: ₹${totalPrice}.`;
    const url = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
        .font-crimson { font-family: 'Crimson Pro', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes shine { 
          0% { transform: translateX(-100%) skewX(-15deg); } 
          100% { transform: translateX(200%) skewX(-15deg); } 
        }
        .animate-shine::after {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%) skewX(-15deg);
          animation: shine 2.5s infinite;
        }
        @keyframes gold-pulse {
            0% { box-shadow: 0 0 0 0 rgba(197, 160, 89, 0.2); }
            70% { box-shadow: 0 0 0 6px rgba(197, 160, 89, 0); }
            100% { box-shadow: 0 0 0 0 rgba(197, 160, 89, 0); }
        }
        .animate-gold-pulse { animation: gold-pulse 2s infinite; }

        /* DYNAMIC WHATSAPP POSITIONING */
        /* Moves the main global WhatsApp button up when sticky bar is visible */
        button[aria-label="Chat on WhatsApp"] {
            transition: bottom 0.4s cubic-bezier(0.25, 0.8, 0.5, 1) !important;
            bottom: ${showStickyBar ? '110px' : '32px'} !important; 
            z-index: 60 !important;
        }

        /* FORCE SHARP CORNERS ON MOBILE */
        @media (max-width: 768px) {
            .mobile-gallery-reset, 
            .mobile-gallery-reset * {
                border-radius: 0 !important;
                border-top-left-radius: 0 !important;
                border-top-right-radius: 0 !important;
                border-bottom-left-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
            }
        }
      `}</style>
      
      <RashiFinderModal 
         isOpen={isRashiModalOpen} 
         onClose={() => setIsRashiModalOpen(false)}
         onRashiSelected={(rashi) => {
            setIsRashiModalOpen(false);
            navigate(`/shop?rashi=${rashi}`);
         }}
      />

      <div className="bg-[#F9FAFB] min-h-screen pb-32 font-sans text-[#111827]">
        
        {/* Breadcrumb - Sticky on Desktop */}
        <div className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-6 py-3 text-[11px] font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wide">
              <Link to="/" className="hover:text-[#2E4F3E] transition-colors">Home</Link> <ChevronRight size={10} />
              <Link to="/shop" className="hover:text-[#2E4F3E] transition-colors">Shop</Link> <ChevronRight size={10} />
              <span className="text-gray-900 truncate">{product.name}</span>
          </div>
        </div>

        {/* MAIN LAYOUT 
            - Laptop: md:px-6, md:pb-8 (NO Top Padding to fix gap)
            - Mobile: px-0 (Full width)
        */}
        <div className="container mx-auto px-0 md:px-6 md:pb-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-12">
            
            {/* Gallery Section 
                - Mobile: .mobile-gallery-reset forces sharp corners
                - Desktop: md:rounded-2xl and md:mt-6 (slight margin to separate from breadcrumb)
            */}
            <div className="w-full lg:w-[58%] overflow-hidden bg-white md:bg-transparent md:rounded-2xl md:mt-6 mobile-gallery-reset">
               <ProductGallery images={galleryImages} />
            </div>

            {/* Details Section */}
            {/* Mobile: px-4 (padding for text), pt-4 (spacing from image) 
                Desktop: md:pt-6 (aligns with image margin)
            */}
            <div className="w-full lg:w-[42%] px-4 md:px-0 pt-4 md:pt-6 relative">
              <div className="lg:sticky lg:top-24 space-y-5">
                
                {/* --- HEADER --- */}
                <div className="border-b border-gray-100 pb-4 mb-2">
                    <div className="flex justify-between items-start mb-2">
                       <span className="bg-[#2E4F3E] text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest shadow-sm">
                          Best Seller
                       </span>
                       <button onClick={handleShare} className="text-gray-400 hover:text-[#2E4F3E] transition-colors p-1.5 hover:bg-white rounded-full">
                          <Share2 size={18} />
                       </button>
                    </div>
                    
                    <h1 className="font-crimson text-2xl md:text-4xl font-bold text-[#111827] mb-2 leading-tight">
                      {product.name}
                    </h1>

                    <div className="flex items-end gap-3 mb-2">
                         <span className="text-3xl font-bold text-[#111827]">
                            ₹{totalPrice.toLocaleString()}
                         </span>
                         {comparePrice > 0 && (
                            <div className="mb-1.5 flex flex-col leading-none">
                                <span className="text-sm text-gray-400 line-through">₹{(comparePrice * quantity).toLocaleString()}</span>
                                <span className="text-[10px] text-[#2E4F3E] font-bold uppercase tracking-wide">
                                   Save {Math.round(((comparePrice - pricePerUnit) / comparePrice) * 100)}%
                                </span>
                            </div>
                         )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-[#C5A059]">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < Math.round(averageRating || 5) ? "currentColor" : "none"} />
                            ))}
                            <span className="text-gray-500 font-medium ml-2 text-xs underline cursor-pointer hover:text-[#2E4F3E]">
                                {reviews.length} Verified Reviews
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- TRUST BADGES --- */}
                <div className="flex items-center gap-4 py-2">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#C5A059]" />
                        <span className="text-[10px] font-bold uppercase text-gray-600">Authentic</span>
                    </div>
                    <div className="w-[1px] h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                        <Truck size={16} className="text-[#C5A059]" />
                        <span className="text-[10px] font-bold uppercase text-gray-600">Free Ship</span>
                    </div>
                    <div className="w-[1px] h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                        <Lock size={16} className="text-[#C5A059]" />
                        <span className="text-[10px] font-bold uppercase text-gray-600">Secure</span>
                    </div>
                </div>

                {/* --- RASHI & QUANTITY --- */}
                <div className="space-y-4">
                    {suitableRashis.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center gap-2 shadow-sm">
                            <span className="text-[10px] font-bold uppercase text-gray-500 mr-1">Best For:</span>
                            {suitableRashis.slice(0, 4).map(r => (
                                <span key={r.name} className="px-2 py-1 bg-[#F9FAFB] border border-gray-200 rounded text-[10px] font-bold text-gray-800 flex items-center gap-1">
                                    {RASHI_EMOJIS[r.name]} {r.name}
                                </span>
                            ))}
                            <button onClick={() => setIsRashiModalOpen(true)} className="text-[10px] font-bold text-[#C5A059] hover:underline ml-auto">
                                Check Compatibility
                            </button>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Quantity</label>
                            <div className="flex items-center bg-white rounded border border-gray-300 h-10 hover:border-[#2E4F3E] transition-colors">
                                <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"><Minus size={14} /></button>
                                <div className="flex-1 text-center font-bold text-sm text-[#111827]">{quantity}</div>
                                <button onClick={() => !isOutOfStock && setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"><Plus size={14} /></button>
                            </div>
                        </div>
                        
                        {coupons.length > 0 && (
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Best Offer</label>
                                <button 
                                  onClick={() => handleCopyCoupon(coupons[0].code)}
                                  className="w-full h-10 flex items-center justify-between px-3 bg-white border border-dashed border-[#C5A059] rounded hover:bg-[#F9FAFB] transition-colors group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Ticket size={14} className="text-[#C5A059]" />
                                        <span className="text-xs font-bold text-[#111827]">{coupons[0].code}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-white bg-[#C5A059] px-2 py-0.5 rounded shadow-sm">
                                        {copiedCoupon === coupons[0].code ? "APPLIED" : "APPLY"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- ENERGIZATION --- */}
                    <div 
                        onClick={() => setAddEnergization(!addEnergization)}
                        className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden
                        ${addEnergization ? 'border-[#C5A059] bg-[#FFFCF5] shadow-sm animate-gold-pulse' : 'border-gray-200 bg-white hover:border-[#C5A059]/50'}`}
                    >
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                 <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${addEnergization ? 'bg-[#C5A059] border-[#C5A059] text-white' : 'border-gray-300 bg-white'}`}>
                                     {addEnergization && <Check size={12} strokeWidth={3} />}
                                 </div>
                                 <span className="text-sm font-bold text-[#111827]">Add Pran Pratistha (Energization)</span>
                             </div>
                             <span className="text-sm font-bold text-[#C5A059]">+₹{ENERGIZATION_COST}</span>
                        </div>
                        
                        <p className="text-[11px] text-gray-500 mt-2 ml-8 leading-relaxed">
                            Vedic ritual performed in your name at Kashi Vishwanath temple to activate spiritual energy.
                        </p>
                        
                        {addEnergization && (
                            <div className="mt-3 ml-8 animate-in slide-in-from-top-2 fade-in">
                                <input 
                                    type="text" 
                                    placeholder="Enter Name for Sankalp (e.g. Rahul)" 
                                    className="w-full text-sm p-2 bg-white border border-[#C5A059]/30 rounded outline-none focus:border-[#C5A059] text-[#111827]"
                                    value={devoteeName}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setDevoteeName(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* --- MAIN BUTTONS (Ref) --- */}
                    <div ref={mainActionsRef} className="flex flex-col gap-3 pt-2">
                        <button 
                            onClick={() => handleDirectOrder('ONLINE')}
                            disabled={isOutOfStock}
                            className={`w-full py-4 rounded-xl flex flex-col items-center justify-center gap-0.5 relative overflow-hidden group
                            ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#111827] text-white hover:bg-black shadow-lg'}`}
                        >
                            <div className="absolute inset-0 w-full h-full overflow-hidden">
                               <div className="animate-shine"></div>
                            </div>
                            
                            <span className="font-bold text-sm uppercase tracking-wider relative z-10 flex items-center gap-2">
                                {isOutOfStock ? "Sold Out" : "Pay Online"} <ArrowRight size={16} />
                            </span>
                            {!isOutOfStock && (
                                <span className="text-[10px] font-bold text-[#C5A059] relative z-10">
                                    Get Extra 5% OFF + Priority Delivery
                                </span>
                            )}
                        </button>

                        <button 
                            onClick={() => handleDirectOrder('COD')}
                            disabled={isOutOfStock}
                            className="w-full py-3.5 border border-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest text-[#111827] hover:bg-gray-50 hover:border-black transition-colors"
                        >
                            Cash on Delivery
                        </button>
                    </div>

                    {/* --- PINCODE & BUY ON WHATSAPP --- */}
                    <div className="flex gap-2 items-center">
                         <div className="relative flex-1">
                            <input 
                                type="text" maxLength={6} placeholder="Pincode" 
                                value={pincode} onChange={(e) => setPincode(e.target.value)}
                                className="w-full h-11 pl-3 pr-10 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:border-[#2E4F3E] transition-colors"
                            />
                            <button onClick={checkDelivery} className="absolute right-0 top-0 h-full px-4 text-[10px] font-bold uppercase hover:text-[#2E4F3E] text-gray-500">Check</button>
                         </div>
                         
                         <button onClick={handleWhatsAppOrder} className="h-11 px-4 bg-[#25D366] text-white rounded-lg flex items-center gap-2 shadow-sm hover:bg-[#20bd5a] transition-colors whitespace-nowrap">
                             <WhatsAppIcon />
                             <div className="flex flex-col items-start leading-none">
                                <span className="text-[8px] font-medium opacity-90 uppercase">Buy on</span>
                                <span className="text-[10px] font-bold">WhatsApp</span>
                             </div>
                         </button>
                    </div>
                    {deliveryDate && <p className="text-[11px] text-[#2E4F3E] font-bold mt-1 flex items-center gap-1 ml-1"><Truck size={12} /> Delivery by {deliveryDate}</p>}

                </div>

                {/* --- ACCORDIONS --- */}
                <div className="border-t border-gray-200 mt-6">
                     {[
                        { id: 'details', label: 'Product Description', content: (
                            <div className="font-sans text-gray-600 text-sm">
                                {(product.detailImageUrls && product.detailImageUrls.length > 0) && (
                                    <img src={product.detailImageUrls[0]} alt="Detail" className="w-full h-auto rounded-lg mb-4 shadow-sm" />
                                )}
                                <p className="leading-relaxed">{product.description}</p>
                            </div>
                        )},
                        { id: 'shipping', label: 'Shipping Information', content: (
                            <ul className="list-disc pl-4 space-y-1 text-gray-600 text-sm font-sans">
                                <li>Dispatched within 24 hours.</li>
                                <li>Delivered in 3-5 working days.</li>
                                <li>Tracking details via SMS/WhatsApp.</li>
                            </ul>
                        )},
                        { id: 'returns', label: 'Return Policy', content: (
                            <ul className="list-disc pl-4 space-y-1 text-gray-600 text-sm font-sans">
                                <li>7-day replacement for damaged items.</li>
                                <li>Unboxing video required for claims.</li>
                            </ul>
                        )}
                     ].map((item) => (
                        <div key={item.id} className="border-b border-gray-200">
                             <button onClick={() => toggleSection(item.id)} className="w-full py-4 flex justify-between items-center text-left hover:text-[#2E4F3E] transition-colors group">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#111827] group-hover:text-[#2E4F3E]">{item.label}</span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${openSections[item.id] ? 'rotate-180' : ''}`} />
                             </button>
                             {openSections[item.id] && (
                                 <div className="pb-5 animate-in slide-in-from-top-1">
                                     {item.content}
                                 </div>
                             )}
                        </div>
                     ))}
                </div>

                {/* Help Box */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4 shadow-sm">
                    <Phone className="text-gray-400" size={20} />
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Need Assistance?</p>
                        <p className="text-xs font-bold text-[#111827]">Call: +91 98765 43210</p>
                    </div>
                </div>

              </div>
            </div>
          </div>

          {/* Similar Products */}
          {recommendations.length > 0 && (
             <div className="mt-20 border-t border-gray-200 pt-10 px-5 md:px-0">
                <h3 className="text-2xl font-crimson font-bold text-[#111827] mb-6">You May Also Like</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                   {recommendations.map((rec) => (
                      <ProductCard key={rec.id} product={rec} />
                   ))}
                </div>
             </div>
          )}
          
          <div className="mt-16 px-5 md:px-0"><ProductReviews productId={product.id} /></div>

          {/* --- SMART STICKY BAR --- */}
          <div className={`fixed bottom-0 left-0 w-full bg-[#2E4F3E] border-t border-[#1F362A] p-3 z-50 transition-transform duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]
              ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
             <div className="container mx-auto max-w-7xl flex items-center justify-between gap-3">
               
               <div className="flex items-center gap-3 overflow-hidden flex-1 md:flex-none">
                  <div className="w-10 h-10 rounded bg-white p-0.5 flex-shrink-0">
                    <img src={galleryImages[0]} alt="" className="w-full h-full object-cover rounded-sm" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-xs font-bold text-white truncate max-w-[120px] md:max-w-xs">{product.name}</p>
                    <p className="text-[10px] md:text-xs font-bold text-[#C5A059]">₹{totalPrice.toLocaleString()}</p>
                  </div>
               </div>

               <div className="flex gap-2 items-center">
                 <button onClick={() => handleDirectOrder('COD')} className="hidden md:block px-5 py-2.5 bg-[#1F362A] border border-[#C5A059]/30 text-white rounded-lg text-xs font-bold uppercase hover:bg-black transition-colors">
                    COD
                 </button>
                 <button onClick={() => handleDirectOrder('ONLINE')} className="px-6 py-3 bg-white text-[#2E4F3E] rounded-lg text-xs font-bold uppercase hover:bg-gray-100 shadow-lg flex items-center gap-2 whitespace-nowrap">
                    Pay Online
                 </button>
               </div>
             </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;