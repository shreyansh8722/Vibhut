import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Loader2, Truck, CheckCircle2, 
  Ticket, ChevronDown, Eye, Package, Info, ArrowRight, AlertTriangle, Minus, Plus,
  Phone, ShieldCheck
} from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import ProductGallery from '../components/shop/ProductGallery';
import { ProductReviews } from '../components/shop/ProductReviews'; 

// WhatsApp Icon SVG Component
const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382C17.119 14.205 15.42 13.382 15.101 13.273C14.786 13.161 14.557 13.107 14.328 13.447C14.099 13.789 13.447 14.538 13.247 14.767C13.05 14.993 12.85 15.024 12.496 14.848C12.143 14.672 10.993 14.295 9.638 13.088C8.563 12.13 7.842 10.953 7.632 10.59C7.42 10.224 7.608 10.034 7.785 9.858C7.943 9.702 8.139 9.453 8.312 9.255C8.484 9.057 8.541 8.887 8.655 8.659C8.77 8.431 8.712 8.232 8.627 8.062C8.541 7.892 7.857 6.206 7.571 5.526C7.294 4.866 7.013 4.957 6.812 4.965C6.626 4.973 6.411 4.975 6.196 4.975C5.981 4.975 5.637 5.055 5.351 5.367C5.065 5.679 4.251 6.444 4.251 8.003C4.251 9.563 5.381 11.066 5.542 11.278C5.7 11.492 7.788 14.881 11.083 16.147C13.84 17.206 14.415 16.995 15.006 16.94C15.659 16.879 17.011 16.158 17.293 15.364C17.575 14.57 17.575 13.889 17.472 14.382Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12.008 24C18.636 24 24.008 18.627 24.008 12C24.008 5.372 18.636 0 12.008 0C5.38 0 0.00800002 5.372 0.00800002 12C0.00800002 14.28 0.65000004 16.397 1.776 18.2L0.60300004 22.845L5.354 21.685C7.307 23.141 9.578 24 12.008 24ZM12.008 21.821C9.919 21.821 7.962 21.143 6.368 19.972L5.975 19.684L2.946 20.423L3.719 17.408L3.399 16.918C2.107 14.939 1.417 12.593 1.417 10.179C1.417 4.549 6.171 0 12.008 0C17.845 0 22.599 4.549 22.599 10.179C22.599 15.809 17.845 20.358 12.008 20.358V21.821Z" />
  </svg>
);

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. Static Data
  const { products, loading: staticLoading } = useProducts();
  
  // 2. Local State
  const [realStock, setRealStock] = useState(null);
  const [isStockLoading, setIsStockLoading] = useState(true);
  const [coupons, setCoupons] = useState([]); 
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const [openSections, setOpenSections] = useState({ details: true, shipping: false });
  const [addEnergization, setAddEnergization] = useState(false);
  const [devoteeName, setDevoteeName] = useState('');
  
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [viewCount, setViewCount] = useState(112);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [orderTimer, setOrderTimer] = useState({ m: 14, s: 59 });

  const mainActionsRef = useRef(null);

  // Config
  const ENERGIZATION_COST = 151;

  const product = products.find(p => String(p.id) === id);
  const recommendations = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const galleryImages = product ? (product.imageUrls || [product.featuredImageUrl]) : [];

  // --- Dynamic Discount Logic ---
  const getDiscountPercent = (qty) => {
    if (qty >= 3) return 15;
    if (qty === 2) return 10; 
    return 0;
  };

  // 3. FETCH LIVE REVIEWS
  useEffect(() => {
    if (!id) return;
    
    const q = query(collection(db, 'reviews'), where('spotId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => doc.data());
      setReviews(fetchedReviews);
      
      if (fetchedReviews.length > 0) {
        const total = fetchedReviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
        setAverageRating(Math.round((total / fetchedReviews.length) * 10) / 10); 
      } else {
        setAverageRating(0);
      }
    });

    return () => unsubscribe();
  }, [id]);

  // 4. FETCH STOCK & COUPONS
  useEffect(() => {
    const fetchLiveData = async () => {
      if (!id) return;
      setIsStockLoading(true);
      try {
        // Stock
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRealStock(data.stock !== undefined ? data.stock : product?.stock || 50);
        } else {
          setRealStock(product?.stock || 50);
        }

        // Coupons
        const couponsSnap = await getDocs(collection(db, 'coupons'));
        const activeCoupons = couponsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(c => c.isActive !== false); 
        setCoupons(activeCoupons);

      } catch (error) {
        console.error("Live data fetch failed:", error);
        setRealStock(product?.stock || 50);
      } finally {
        setIsStockLoading(false);
      }
    };

    fetchLiveData();
  }, [id, product]);

  // Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting), { root: null, threshold: 0.1 }
    );
    if (mainActionsRef.current) observer.observe(mainActionsRef.current);

    const viewInterval = setInterval(() => {
       setViewCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    
    const timerInterval = setInterval(() => {
      setOrderTimer(prev => {
        if (prev.s === 0) return { m: prev.m - 1, s: 59 };
        return { ...prev, m: prev.m, s: prev.s - 1 };
      });
    }, 1000);

    return () => { 
      if (mainActionsRef.current) observer.unobserve(mainActionsRef.current);
      clearInterval(viewInterval); 
      clearInterval(timerInterval); 
    };
  }, []);

  if (staticLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#B08D55]" size={40} /></div>;
  if (!product) return <div className="h-[60vh] flex flex-col items-center justify-center gap-4 bg-white"><h2 className="text-2xl font-heading text-gray-900">Artifact not found</h2><button onClick={() => navigate('/shop')} className="text-[#B08D55] underline">Return to shop</button></div>;

  // --- Price Calculations ---
  const basePrice = Number(product.price);
  const comparePrice = Number(product.comparePrice);
  
  const discountPercent = getDiscountPercent(quantity);
  const pricePerUnit = basePrice - (basePrice * (discountPercent / 100));
  const totalPrice = (pricePerUnit * quantity) + (addEnergization ? ENERGIZATION_COST : 0);

  const isOutOfStock = !isStockLoading && realStock !== null && realStock < quantity;
  const isLowStock = !isStockLoading && realStock > 0 && realStock < 5;

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setActiveCoupon(code);
    setTimeout(() => setActiveCoupon(null), 2000);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const incrementQty = () => {
    if (isStockLoading) return;
    if (realStock !== null && quantity >= realStock) {
      alert(`Only ${realStock} units available in stock.`);
      return; 
    }
    setQuantity(prev => prev + 1);
  };
  
  const decrementQty = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

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

    navigate('/checkout', { 
      state: { 
        directPurchase: [directItem], 
        paymentMode 
      } 
    });
  };

  const checkDelivery = () => {
    if (pincode.length !== 6) return;
    setIsChecking(true);
    setTimeout(() => {
      const date = new Date();
      date.setDate(date.getDate() + 4);
      setDeliveryDate(date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }));
      setIsChecking(false);
    }, 1000);
  };

  return (
    <>
      <style>{`
        @keyframes shine { 
          0% { transform: translateX(-100%); } 
          100% { transform: translateX(100%); } 
        }
        .animate-shine { animation: shine 1.5s infinite linear; }
        
        @keyframes gold-pulse { 0% { box-shadow: 0 0 0 0 rgba(176, 141, 85, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(176, 141, 85, 0); } 100% { box-shadow: 0 0 0 0 rgba(176, 141, 85, 0); } }
        .animate-gold-pulse { animation: gold-pulse 2s infinite; }
      `}</style>

      <div className="bg-white min-h-screen pb-32 font-body text-gray-900 relative">
        
        {/* Breadcrumbs - Hidden on Mobile, Visible on Desktop */}
        <div className="hidden md:block bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">
              <Link to="/" className="hover:text-[#B08D55]">Home</Link> <ChevronRight size={10} />
              <Link to="/shop" className="hover:text-[#B08D55]">Shop</Link> <ChevronRight size={10} />
              <span className="text-gray-900 font-bold truncate max-w-[150px]">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-8 pt-0 md:pt-6">
          
          {/* UPDATED: Gap-0 for Mobile to remove white space */}
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-10">
            
            {/* Gallery */}
            <div className="w-full lg:w-[58%]">
               <ProductGallery images={galleryImages} />
            </div>

            {/* Buy Box */}
            <div className="w-full lg:w-[42%] mt-3 lg:mt-0">
              
              {/* Header */}
              <div className="mb-2 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-[#B08D55]/10 text-[#B08D55] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Best Seller</span>
                     <div className="flex items-center gap-1 text-[11px] text-gray-500"><Eye size={12} /> {viewCount} people viewing</div>
                  </div>
                  {/* UPDATED: Smaller font on mobile (text-2xl) */}
                  <h1 className="font-heading text-2xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
                  
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1 text-[#B08D55]">
                        {[1,2,3,4,5].map(i => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i <= Math.round(averageRating) ? "currentColor" : "none"} 
                            className={i <= Math.round(averageRating) ? "text-[#B08D55]" : "text-gray-300"}
                            strokeWidth={i <= Math.round(averageRating) ? 0 : 1.5} 
                          />
                        ))}
                        <span className="text-xs font-medium text-gray-500 ml-1">
                          ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
                        </span>
                     </div>
                  </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                 <div className="flex items-end gap-3 mb-1">
                    <span className="text-4xl font-heading font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                    {comparePrice > 0 && <span className="text-lg text-gray-400 line-through mb-1.5 font-light">₹{(comparePrice * quantity).toLocaleString()}</span>}
                    {comparePrice > 0 && <span className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded mb-2">-{Math.round(((comparePrice - pricePerUnit) / comparePrice) * 100)}%</span>}
                 </div>
                 
                 {isLowStock && (
                    <div className="text-xs font-bold text-red-600 flex items-center gap-1.5 animate-pulse mt-1">
                        <AlertTriangle size={14} className="fill-red-100" />
                        Hurry! Only {realStock} units left in stock.
                    </div>
                 )}

                 <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Order within <span className="text-gray-900 font-bold">{orderTimer.m}m {orderTimer.s}s</span> for dispatch today.
                 </p>
              </div>

              {/* Live Coupons */}
              {coupons.length > 0 && (
                <div className="mb-3 bg-[#B08D55]/5 rounded-lg p-3 border border-dashed border-[#B08D55]/30">
                   <div className="flex flex-col gap-2">
                       {coupons.slice(0, 2).map((coupon, idx) => (
                         <div key={idx} className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <Ticket size={14} className="text-[#B08D55]" />
                                <div>
                                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">{coupon.description || `Get ${coupon.discountAmount}% Off`}</p>
                                  <p className="text-[10px] text-gray-500">Use code <span className="font-bold">{coupon.code}</span></p>
                                </div>
                             </div>
                             <button onClick={() => handleCopyCoupon(coupon.code)} className="text-[10px] font-bold text-gray-900 underline hover:text-[#B08D55]">
                                 {activeCoupon === coupon.code ? 'COPIED' : 'COPY'}
                             </button>
                         </div>
                       ))}
                   </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quantity</span>
                   <span className="text-[11px] font-bold text-[#B08D55] animate-pulse">
                     {quantity === 1 ? "Buy 2 to Save 10%" : quantity === 2 ? "Add 1 more to Save 15%" : "🎉 Max Discount Applied!"}
                   </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-10 w-32">
                    <button 
                      onClick={decrementQty}
                      className="w-10 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-r border-gray-300 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="flex-1 h-full flex items-center justify-center font-bold text-gray-900 text-base">
                      {quantity}
                    </div>
                    <button 
                      onClick={incrementQty}
                      disabled={isOutOfStock}
                      className="w-10 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-l border-gray-300 transition-colors disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  {discountPercent > 0 && (
                    <div className="h-10 px-3 rounded-lg bg-green-100 text-green-800 flex flex-col justify-center border border-green-200">
                      <span className="text-[9px] uppercase font-bold tracking-wider">You Save</span>
                      <span className="text-xs font-bold">{discountPercent}% OFF</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Energization */}
              <div className={`mb-6 border rounded-lg overflow-hidden transition-all duration-300 ${addEnergization ? 'border-[#B08D55] bg-white ring-1 ring-[#B08D55] shadow-lg' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                 <div onClick={() => setAddEnergization(!addEnergization)} className="p-3 cursor-pointer flex items-center justify-between group relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                       <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${addEnergization ? 'bg-[#B08D55] text-white scale-110' : 'border border-gray-400 bg-white animate-gold-pulse'}`}>
                          {addEnergization ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-[#B08D55]/30"></div>}
                       </div>
                       <div>
                          <p className={`font-bold text-sm transition-colors flex items-center gap-2 ${addEnergization ? 'text-[#B08D55]' : 'text-gray-900'}`}>
                             Get it Siddh/Energized
                          </p>
                          <p className="text-[10px] text-gray-500">Authentic Pran Pratistha from Kashi (Varanasi)</p>
                       </div>
                    </div>
                    <span className="text-sm font-bold text-[#B08D55] relative z-10">+₹{ENERGIZATION_COST}</span>
                    {addEnergization && <div className="absolute inset-0 bg-[#B08D55]/5 z-0"></div>}
                 </div>
                 {addEnergization && (
                   <div className="px-3 pb-3 pt-0 animate-fade-in bg-white/50">
                      <input type="text" placeholder="Enter Name for Sankalp (e.g. Rahul Sharma)" 
                        className="w-full text-sm p-2.5 border border-gray-200 rounded-md focus:border-[#B08D55] outline-none bg-white mt-2"
                        value={devoteeName} onChange={(e) => setDevoteeName(e.target.value)}
                      />
                   </div>
                 )}
              </div>

              {/* Main Actions */}
              <div ref={mainActionsRef} className="flex flex-col gap-3 mb-6">
                 <button 
                    onClick={() => handleDirectOrder('ONLINE')}
                    disabled={isOutOfStock}
                    className={`w-full py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 group relative overflow-hidden transition-all 
                    ${isOutOfStock 
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                        : 'bg-gray-900 text-white hover:bg-[#B08D55] hover:shadow-xl hover:-translate-y-0.5'}`}
                 >
                    {isOutOfStock ? (
                      <span className="font-bold text-sm uppercase tracking-widest">Out of Stock</span>
                    ) : (
                      <>
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                           <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shine"></div>
                        </div>
                        <div className="flex flex-col items-center leading-none relative z-20">
                           <span className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-yellow-50">Pay Online <ArrowRight size={16} /></span>
                           <span className="text-[10px] text-white/80 mt-1 font-medium group-hover:text-white transition-colors">Get Extra 5% OFF • Fast Dispatch</span>
                        </div>
                      </>
                    )}
                 </button>

                 <button 
                    onClick={() => handleDirectOrder('COD')}
                    disabled={isOutOfStock}
                    className={`w-full py-3.5 border font-bold text-xs uppercase tracking-widest rounded-lg transition-all 
                    ${isOutOfStock ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-900 hover:border-black'}`}
                 >
                    Cash on Delivery
                 </button>
              </div>

              {/* Need Help Section */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                 <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                    <WhatsAppIcon size={18} />
                    <span className="text-xs font-bold uppercase">Order on WhatsApp</span>
                 </a>
                 <a href="tel:+919876543210" 
                    className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <Phone size={18} />
                    <span className="text-xs font-bold uppercase">Call Expert</span>
                 </a>
              </div>

              {/* Trust Strip */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-medium mb-6 py-3 border-t border-b border-gray-100">
                 <span className="flex items-center gap-1"><ShieldCheck size={12} /> 100% Authentic</span>
                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                 <span className="flex items-center gap-1"><Truck size={12} /> Fast Shipping</span>
                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                 <span className="flex items-center gap-1">🔒 Secure Payment</span>
              </div>

              {/* Delivery Check */}
              <div className="mb-8">
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Truck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" maxLength={6} placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full h-10 pl-10 pr-4 text-sm border-b border-gray-300 focus:border-black outline-none bg-transparent" />
                    </div>
                    <button onClick={checkDelivery} className="text-xs font-bold uppercase text-[#B08D55] hover:text-black">Check Date</button>
                 </div>
                 {deliveryDate && <p className="text-xs text-green-700 mt-2 flex items-center gap-1.5 animate-fade-in"><span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Delivery by {deliveryDate}</p>}
              </div>

              {/* Accordions */}
              <div className="border-t border-gray-200">
                  {['Product Details', 'Shipping & Returns'].map((section, idx) => {
                     const key = section.split(' ')[0].toLowerCase();
                     const isOpen = key === 'product' ? openSections.details : openSections.shipping;
                     return (
                      <div key={idx} className="border-b border-gray-200">
                         <button onClick={() => toggleSection(key === 'product' ? 'details' : 'shipping')} className="w-full py-4 flex items-center justify-between text-left group hover:bg-gray-50/50">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2">{key === 'product' ? <Info size={16} /> : <Package size={16} />} {section}</span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                         </button>
                         <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isOpen ? 'max-h-[800px]' : 'max-h-0'}`}>
                            <div className="pb-6 text-sm text-gray-600 leading-relaxed px-1">
                               {key === 'product' ? (
                                 <>
                                   <p>{product.description || "Authentic spiritual artifact sourced from Kashi."}</p>
                                   {product.detailImageUrls && product.detailImageUrls.length > 0 && (
                                     <div className="mt-6 flex flex-col gap-4">
                                        {product.detailImageUrls.map((url, imgIdx) => (
                                          <img key={imgIdx} src={url} alt={`Detail ${imgIdx + 1}`} className="w-full rounded-lg border border-gray-100" />
                                        ))}
                                     </div>
                                   )}
                                 </>
                               ) : (
                                 <p>• Dispatch: Within 24 hours.<br/>• Returns: 7-Day no-questions-asked.</p>
                               )}
                            </div>
                         </div>
                      </div>
                     );
                  })}
              </div>
            </div>
          </div>

          {/* REVIEWS COMPONENT */}
          <div className="mt-12">
            <ProductReviews productId={product.id} />
          </div>

          {/* Recommendations */}
          <div className="mt-20 border-t border-gray-200 pt-10 mb-10">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-heading text-2xl font-bold text-gray-900">You May Also Like</h3>
                <Link to="/shop" className="text-xs font-bold text-[#B08D55] uppercase tracking-widest hover:text-black">View Collection</Link>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommendations.map((rec) => (
                   <Link key={rec.id} to={`/product/${rec.id}`} className="group block">
                      <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                         <img src={rec.featuredImageUrl} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <h4 className="font-heading font-bold text-gray-900 line-clamp-1 group-hover:text-[#B08D55]">{rec.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">₹{rec.price}</p>
                   </Link>
                ))}
             </div>
          </div>
        </div>

        {/* Sticky Mobile Bar */}
        <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 z-50 transition-transform duration-300 shadow-xl ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:flex items-center gap-3">
               <img src={galleryImages[0]} alt="Product" className="w-10 h-10 rounded object-cover border border-gray-200" />
               <div>
                  <p className="font-heading font-bold text-sm text-gray-900 truncate max-w-[150px]">{product.name}</p>
                  <p className="text-xs font-bold text-[#B08D55]">₹{totalPrice.toLocaleString()}</p>
               </div>
            </div>
            <div className="flex gap-3 flex-1 md:flex-none md:w-auto">
               <button onClick={() => handleDirectOrder('COD')} disabled={isOutOfStock} className="flex-1 md:w-40 py-3 bg-white border border-gray-300 text-gray-900 text-[10px] md:text-xs font-bold uppercase rounded-md tracking-widest hover:bg-gray-50 disabled:opacity-50">COD</button>
               
               {/* STICKY BUTTON: Black BG -> Gold Hover */}
               <button 
                 onClick={() => handleDirectOrder('ONLINE')}
                 disabled={isOutOfStock} 
                 className={`flex-[1.5] md:w-56 py-3 text-white text-[10px] md:text-xs font-bold uppercase rounded-md tracking-widest shadow-lg transition-all relative overflow-hidden group
                   ${isOutOfStock 
                     ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                     : 'bg-gray-900 hover:bg-[#B08D55]'}`}
               >
                 {isOutOfStock ? "Out of Stock" : (
                    <>
                      <div className="absolute inset-0 w-full h-full overflow-hidden">
                           <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shine"></div>
                      </div>
                      <span className="relative z-10">Pay Online</span>
                    </>
                 )}
               </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;