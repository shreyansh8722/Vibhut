import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Loader2, Truck, CheckCircle2, ShieldCheck, 
  Sparkles, Ticket, ChevronDown, Zap, PlayCircle, Eye, RefreshCw, 
  Package, Info, CreditCard, Gift, Timer, Flame, ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import ProductGallery from '../components/shop/ProductGallery';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  
  // --- STATES ---
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState('significance');
  
  // Accordion States
  const [openSections, setOpenSections] = useState({
    details: true,
    shipping: false,
    returns: false
  });
  
  // Energization States
  const [addEnergization, setAddEnergization] = useState(false);
  const [devoteeName, setDevoteeName] = useState('');
  
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [viewCount, setViewCount] = useState(112);
  const [stockLeft, setStockLeft] = useState(7);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [orderTimer, setOrderTimer] = useState({ m: 14, s: 59 });

  const mainActionsRef = useRef(null);

  // --- CONFIG ---
  const ONLINE_DISCOUNT = 50; 
  const ENERGIZATION_COST = 151;

  const product = products.find(p => String(p.id) === id);
  // Recommendations logic: simple category match
  const recommendations = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const galleryImages = product ? (product.imageUrls || [product.featuredImageUrl]) : [];

  const combos = [
    { qty: 1, label: "Single", discount: 0, tag: "Standard" },
    { qty: 2, label: "Pair", discount: 10, tag: "Popular" },
    { qty: 3, label: "Family", discount: 15, tag: "Best Value" }
  ];

  // Logic: Sticky Bar & Urgency Timers
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { root: null, threshold: 0.1 } 
    );
    if (mainActionsRef.current) observer.observe(mainActionsRef.current);
    return () => { if (mainActionsRef.current) observer.unobserve(mainActionsRef.current); };
  }, []);

  useEffect(() => {
    // Fake "Live" View Count fluctuation
    const interval = setInterval(() => {
       setViewCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    
    // Countdown Timer (Order within XX mins)
    const timer = setInterval(() => {
      setOrderTimer(prev => {
        if (prev.s === 0) return { m: prev.m - 1, s: 59 };
        return { ...prev, m: prev.m, s: prev.s - 1 };
      });
    }, 1000);

    return () => { clearInterval(interval); clearInterval(timer); };
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[var(--color-primary)]" size={40} /></div>;
  if (!product) return <div className="h-[60vh] flex flex-col items-center justify-center gap-4 bg-white"><h2 className="text-2xl font-heading text-black">Artifact not found</h2><button onClick={() => navigate('/shop')} className="text-[var(--color-primary)] underline">Return to shop</button></div>;

  const basePrice = Number(product.price);
  const comparePrice = Number(product.comparePrice);
  const selectedCombo = combos.find(c => c.qty === quantity) || combos[0];
  const comboPricePerUnit = basePrice - (basePrice * (selectedCombo.discount / 100));
  const totalPrice = (comboPricePerUnit * quantity) + (addEnergization ? ENERGIZATION_COST : 0);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setActiveCoupon(code);
    setTimeout(() => setActiveCoupon(null), 2000);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleDirectOrder = (paymentMode) => {
    addToCart(product, 'Standard', quantity, { 
      energization: addEnergization,
      energizationDetails: addEnergization ? { name: devoteeName } : null
    });
    navigate('/checkout', { state: { paymentMode } });
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
    <div className="bg-white min-h-screen pb-32 font-body text-black relative">
      
      {/* 1. BREADCRUMBS */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">
            <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link> <ChevronRight size={10} />
            <Link to="/shop" className="hover:text-[var(--color-primary)]">Shop</Link> <ChevronRight size={10} />
            <span className="text-black font-bold truncate max-w-[150px]">{product.name}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold uppercase animate-pulse">
             <Flame size={12} fill="currentColor" /> Only {stockLeft} Left
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pt-6">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* 2. LEFT: GALLERY */}
          <div className="w-full lg:w-[58%]">
             <ProductGallery images={galleryImages} />
          </div>

          {/* 3. RIGHT: BUY BOX */}
          <div className="w-full lg:w-[42%]">
            
            {/* INFINITE MARQUEE STRIP */}
<div className="w-full bg-black text-white rounded overflow-hidden mb-5 py-2.5 relative border border-gray-800 shadow-lg group">
   {/* Gradients to fade edges */}
   <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black to-transparent z-10"></div>
   <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black to-transparent z-10"></div>
   
   {/* Animated Container */}
   <div className="animate-marquee flex gap-10 text-[9px] font-bold uppercase tracking-[0.2em] text-heritage-saffron">
      {/* Set 1 */}
      <span className="flex items-center gap-2 flex-shrink-0"><Sparkles size={10}/> 100% Authentic From Kashi</span>
      <span className="flex items-center gap-2 flex-shrink-0"><ShieldCheck size={10}/> Lab Certified Purity</span>
      <span className="flex items-center gap-2 flex-shrink-0"><Zap size={10}/> Energized by Vedic Pandits</span>
      <span className="flex items-center gap-2 flex-shrink-0"><RefreshCw size={10}/> 7-Day Easy Returns</span>
      
      {/* Set 2 (Duplicate) */}
      <span className="flex items-center gap-2 flex-shrink-0"><Sparkles size={10}/> 100% Authentic From Kashi</span>
      <span className="flex items-center gap-2 flex-shrink-0"><ShieldCheck size={10}/> Lab Certified Purity</span>
      <span className="flex items-center gap-2 flex-shrink-0"><Zap size={10}/> Energized by Vedic Pandits</span>
      <span className="flex items-center gap-2 flex-shrink-0"><RefreshCw size={10}/> 7-Day Easy Returns</span>

      {/* Set 3 (Duplicate for wider screens) */}
      <span className="flex items-center gap-2 flex-shrink-0"><Sparkles size={10}/> 100% Authentic From Kashi</span>
      <span className="flex items-center gap-2 flex-shrink-0"><ShieldCheck size={10}/> Lab Certified Purity</span>
      <span className="flex items-center gap-2 flex-shrink-0"><Zap size={10}/> Energized by Vedic Pandits</span>
      <span className="flex items-center gap-2 flex-shrink-0"><RefreshCw size={10}/> 7-Day Easy Returns</span>
   </div>
</div>

            {/* Title & Reviews */}
            <div className="mb-5">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-black mb-2 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                   <div className="flex items-center gap-2 cursor-pointer" onClick={() => document.getElementById('details').scrollIntoView({ behavior: 'smooth'})}>
                      <div className="flex text-amber-500 gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                      </div>
                      <span className="text-xs font-bold text-gray-400 underline decoration-dotted">245 Reviews</span>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                      <Eye size={12} /> {viewCount} Viewing Now
                   </div>
                </div>
            </div>

            {/* PRICE & URGENCY */}
            <div className="mb-5">
               <div className="flex items-end gap-3 mb-1">
                  <span className="text-4xl font-heading font-bold text-black">₹{totalPrice.toLocaleString()}</span>
                  {comparePrice > 0 && (
                     <span className="text-lg text-gray-400 line-through mb-1">₹{(comparePrice * quantity).toLocaleString()}</span>
                  )}
                  {comparePrice > 0 && (
                    <span className="text-[10px] font-bold text-white bg-[var(--color-primary)] px-2 py-1 rounded mb-1.5 shadow-sm">
                       {Math.round(((comparePrice - comboPricePerUnit) / comparePrice) * 100)}% OFF
                    </span>
                  )}
               </div>
               <p className="text-[11px] text-[var(--color-primary)] font-bold flex items-center gap-1 animate-pulse">
                  <Timer size={12} /> Order in {orderTimer.m}m {orderTimer.s}s for dispatch today!
               </p>
            </div>

            {/* COUPONS (Below Price) */}
            <div className="mb-6 bg-yellow-50/50 border border-dashed border-yellow-200 rounded-lg p-3">
               <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <Ticket size={14} className="text-yellow-600" />
                      <span className="text-xs font-bold text-gray-800">Save Extra ₹100</span>
                   </div>
                   <button onClick={() => handleCopyCoupon('WELCOME100')} className="text-[10px] font-bold text-[var(--color-primary)] uppercase bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                       {activeCoupon === 'WELCOME100' ? 'APPLIED' : 'APPLY "WELCOME100"'}
                   </button>
               </div>
            </div>

            {/* PACK SELECTION */}
            <div className="mb-6">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Quantity</span>
               <div className="flex gap-2">
                  {combos.map((combo) => (
                    <div 
                      key={combo.qty}
                      onClick={() => setQuantity(combo.qty)}
                      className={`flex-1 cursor-pointer border rounded p-2 text-center transition-all relative overflow-hidden ${quantity === combo.qty ? 'border-black bg-black text-white shadow-lg scale-[1.02]' : 'border-gray-200 bg-white text-gray-600 hover:border-black'}`}
                    >
                       {combo.discount > 0 && (
                          <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-bl">
                             SAVE {combo.discount}%
                          </div>
                       )}
                       <span className="block text-[10px] font-bold uppercase opacity-80">{combo.label}</span>
                       <span className="block font-bold text-sm mt-0.5">₹{(comboPricePerUnit * combo.qty).toLocaleString()}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* --- PRAN PRATISTHA (ALIVE EFFECT) --- */}
            {/* Added: 'ring' animation, Gold border, Free Gift Badge */}
            <div className={`mb-6 border-2 rounded-xl overflow-hidden transition-all duration-300 relative ${addEnergization ? 'border-yellow-500 bg-yellow-50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-gray-200 bg-white'}`}>
               
               {/* "FREE GIFTS" BADGE */}
               <div className="absolute top-0 right-0 bg-gradient-to-r from-[var(--color-primary)] to-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">
                  + FREE GANGA JAL & BHABHUTI
               </div>

               <div 
                 onClick={() => setAddEnergization(!addEnergization)}
                 className="p-4 cursor-pointer flex items-center justify-between relative z-0"
               >
                  <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${addEnergization ? 'bg-yellow-500 border-yellow-500 scale-110' : 'border-gray-300 bg-white'}`}>
                        {addEnergization && <CheckCircle2 size={12} className="text-white" />}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-sm text-black uppercase tracking-wide flex items-center gap-1">
                              Add Pran Pratistha <Sparkles size={12} className={addEnergization ? "text-yellow-600 animate-pulse" : "text-gray-400"} />
                           </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Vedic energization in your name + Video Proof.</p>
                     </div>
                  </div>
                  <div className="text-right mt-4">
                     <span className="block text-xs font-bold text-black line-through text-gray-400">₹501</span>
                     <span className="block text-sm font-bold text-[var(--color-primary)]">₹{ENERGIZATION_COST}</span>
                  </div>
               </div>

               {addEnergization && (
                 <div className="px-4 pb-4 animate-fade-in border-t border-yellow-200/50 mt-1 pt-3">
                    <input 
                      type="text" placeholder="Enter Name for Sankalp (e.g. Rahul)" 
                      className="w-full text-xs p-2.5 border border-yellow-300 rounded bg-white focus:border-[var(--color-primary)] outline-none mb-2 shadow-inner"
                      value={devoteeName} onChange={(e) => setDevoteeName(e.target.value)}
                    />
                    <div className="flex items-center gap-2 text-[10px] text-gray-600 bg-white p-2 rounded border border-yellow-100">
                       <Gift size={12} className="text-[var(--color-primary)]" />
                       <span>You will receive <strong>Abhimantrit Ganga Jal</strong> & <strong>Kashi Bhabhuti</strong> with this order.</span>
                    </div>
                 </div>
               )}
            </div>

            {/* --- BUTTONS --- */}
            <div ref={mainActionsRef} className="flex flex-col gap-3 mb-4">
               {/* PAY ONLINE - POP EFFECT */}
               <button 
                  onClick={() => handleDirectOrder('ONLINE')}
                  className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-red-600 text-white rounded-lg shadow-lg hover:shadow-red-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
               >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
                  
                  <div className="flex flex-col items-center leading-none relative z-20">
                     <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
                        <Zap size={18} className="fill-yellow-300 text-yellow-300 animate-pulse" /> 
                        Pay Online
                     </div>
                     <span className="text-[9px] text-yellow-100 mt-1 font-medium bg-black/20 px-2 py-0.5 rounded">
                        Fastest Dispatch + Extra ₹{ONLINE_DISCOUNT} OFF
                     </span>
                  </div>
               </button>

               <button 
                  onClick={() => handleDirectOrder('COD')}
                  className="w-full py-3.5 bg-white border border-gray-300 text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:border-black transition-all flex items-center justify-center gap-2"
               >
                  <CreditCard size={14} /> Cash on Delivery
               </button>
            </div>

            {/* DELIVERY CHECKER (Immediately below Buttons) */}
            <div className="mb-8">
               <div className="flex gap-2 h-10">
                  <div className="relative flex-1">
                      <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                         type="text" maxLength={6} placeholder="Enter Pincode to Check"
                         value={pincode} onChange={(e) => setPincode(e.target.value)}
                         className="w-full h-full pl-9 pr-4 text-xs border border-gray-300 rounded focus:border-black outline-none bg-white"
                      />
                  </div>
                  <button onClick={checkDelivery} className="px-5 h-full bg-black text-white text-[10px] font-bold uppercase rounded tracking-widest hover:bg-gray-800">
                     Check
                  </button>
               </div>
               {deliveryDate && (
                  <p className="text-[10px] text-[var(--color-success)] font-bold mt-2 flex items-center gap-1 animate-fade-in">
                     <CheckCircle2 size={12} /> Eligible for Express Delivery by {deliveryDate}
                  </p>
               )}
            </div>

            {/* --- DETAILED ACCORDIONS --- */}
            <div className="border-t border-gray-200">
                {/* 1. PRODUCT DETAILS */}
                <div className="border-b border-gray-200">
                   <button onClick={() => toggleSection('details')} className="w-full py-4 flex items-center justify-between text-left group">
                      <span className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                         <Info size={14} strokeWidth={1.5} /> Product Details
                      </span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${openSections.details ? 'rotate-180' : ''}`} />
                   </button>
                   <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${openSections.details ? 'max-h-[500px]' : 'max-h-0'}`}>
                      <div className="pb-4 text-sm text-gray-600 space-y-3 leading-relaxed">
                         <p>The <strong>{product.name}</strong> is a consecrated tool from Varanasi. Selected for its seed geometry, it aligns your aura with prosperity.</p>
                         <ul className="grid grid-cols-1 gap-2 mt-2">
                            {["Original Lab Certified Bead", "Natural, Untreated Material", "Sourced from Nepal/Indonesia"].map((feat, i) => (
                               <li key={i} className="flex items-center gap-2 text-black font-medium text-xs">
                                  <div className="w-1 h-1 bg-black rounded-full"></div> {feat}
                               </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </div>

                {/* 2. SHIPPING */}
                <div className="border-b border-gray-200">
                   <button onClick={() => toggleSection('shipping')} className="w-full py-4 flex items-center justify-between text-left group">
                      <span className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                         <Package size={14} strokeWidth={1.5} /> Shipping
                      </span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${openSections.shipping ? 'rotate-180' : ''}`} />
                   </button>
                   <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${openSections.shipping ? 'max-h-[200px]' : 'max-h-0'}`}>
                      <div className="pb-4 text-xs text-gray-500 space-y-2">
                         <p><strong>Dispatch:</strong> Within 24 hours.</p>
                         <p><strong>Partners:</strong> Bluedart, Delhivery.</p>
                      </div>
                   </div>
                </div>

                {/* 3. RETURNS */}
                <div className="border-b border-gray-200">
                   <button onClick={() => toggleSection('returns')} className="w-full py-4 flex items-center justify-between text-left group">
                      <span className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                         <RefreshCw size={14} strokeWidth={1.5} /> Returns
                      </span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${openSections.returns ? 'rotate-180' : ''}`} />
                   </button>
                   <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${openSections.returns ? 'max-h-[200px]' : 'max-h-0'}`}>
                      <div className="pb-4 text-xs text-gray-500 space-y-2">
                         <p><strong>Policy:</strong> 7-Day Easy Returns.</p>
                         <p>Damaged/Wrong product? Instant replacement.</p>
                      </div>
                   </div>
                </div>
            </div>

          </div>
        </div>

        {/* 4. RECOMMENDATIONS (You May Also Like) */}
        <div className="mt-16 border-t border-gray-200 pt-10">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl font-bold text-black">You May Also Like</h3>
              <Link to="/shop" className="text-xs font-bold text-[var(--color-primary)] uppercase">View All</Link>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {recommendations.length > 0 ? recommendations.map((rec) => (
                 <Link key={rec.id} to={`/product/${rec.id}`} className="group block">
                    <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                       <img src={rec.featuredImageUrl} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight size={14} />
                       </div>
                    </div>
                    <h4 className="font-bold text-sm text-black line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">{rec.name}</h4>
                    <p className="text-xs text-gray-500">₹{rec.price}</p>
                 </Link>
              )) : (
                 <div className="col-span-4 text-center text-gray-400 text-sm italic py-8">More spiritual tools coming soon...</div>
              )}
           </div>
        </div>

      </div>

      {/* 5. STICKY BAR */}
      <div 
        className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 z-50 transition-transform duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
             <img src={galleryImages[0]} alt="Product" className="w-10 h-10 rounded object-cover border border-gray-200 hidden md:block" />
             <div>
                <p className="font-heading font-bold text-sm text-black truncate max-w-[150px]">{product.name}</p>
                <p className="text-xs font-bold text-[var(--color-primary)]">₹{totalPrice.toLocaleString()}</p>
             </div>
          </div>
          <div className="flex gap-2 flex-1 md:flex-none md:w-auto">
             <button onClick={() => handleDirectOrder('COD')} className="flex-1 md:w-40 py-3 bg-white border border-black text-black text-[10px] md:text-xs font-bold uppercase rounded">COD</button>
             <button onClick={() => handleDirectOrder('ONLINE')} className="flex-[1.5] md:w-56 py-3 bg-[var(--color-primary)] text-white text-[10px] md:text-xs font-bold uppercase rounded shadow-lg">Pay Online & Save</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetailsPage;