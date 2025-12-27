import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Loader2, Truck, CheckCircle2, 
  Ticket, ChevronDown, Eye, Package, Info, ArrowRight, Gift, Sparkles
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
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [orderTimer, setOrderTimer] = useState({ m: 14, s: 59 });

  const mainActionsRef = useRef(null);

  // --- CONFIG ---
  const ONLINE_DISCOUNT = 50; 
  const ENERGIZATION_COST = 151;

  const product = products.find(p => String(p.id) === id);
  const recommendations = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const galleryImages = product ? (product.imageUrls || [product.featuredImageUrl]) : [];

  const combos = [
    { qty: 1, label: "Single", discount: 0 },
    { qty: 2, label: "Pair (2) (Save 10%)", discount: 10 },
    { qty: 3, label: "Family (3) (Save 15%)", discount: 15 }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { root: null, threshold: 0.1 } 
    );
    if (mainActionsRef.current) observer.observe(mainActionsRef.current);
    return () => { if (mainActionsRef.current) observer.unobserve(mainActionsRef.current); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
       setViewCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    
    const timer = setInterval(() => {
      setOrderTimer(prev => {
        if (prev.s === 0) return { m: prev.m - 1, s: 59 };
        return { ...prev, m: prev.m, s: prev.s - 1 };
      });
    }, 1000);

    return () => { clearInterval(interval); clearInterval(timer); };
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#B08D55]" size={40} /></div>;
  if (!product) return <div className="h-[60vh] flex flex-col items-center justify-center gap-4 bg-white"><h2 className="text-2xl font-heading text-gray-900">Artifact not found</h2><button onClick={() => navigate('/shop')} className="text-[#B08D55] underline">Return to shop</button></div>;

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

  // --- UPDATED: HANDLE DIRECT ORDER ---
  const handleDirectOrder = (paymentMode) => {
    // Construct the item object directly
    const directItem = {
      id: product.id,
      name: product.name,
      price: comboPricePerUnit, // Pass the discounted unit price
      quantity: quantity,
      variant: selectedCombo.label,
      image: galleryImages[0],
      energization: addEnergization,
      energizationDetails: addEnergization ? { name: devoteeName } : null
    };

    // Navigate to checkout with this specific item in state
    // We do NOT call addToCart() here, preserving the user's existing cart
    navigate('/checkout', { 
      state: { 
        directPurchase: [directItem], // Pass as an array
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
          20% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 3s infinite linear;
        }
        @keyframes gold-pulse {
          0% { box-shadow: 0 0 0 0 rgba(176, 141, 85, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(176, 141, 85, 0); }
          100% { box-shadow: 0 0 0 0 rgba(176, 141, 85, 0); }
        }
        .animate-gold-pulse {
          animation: gold-pulse 2s infinite;
        }
      `}</style>

      <div className="bg-white min-h-screen pb-32 font-body text-gray-900 relative">
        
        {/* 1. BREADCRUMBS */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">
              <Link to="/" className="hover:text-[#B08D55] transition-colors">Home</Link> <ChevronRight size={10} />
              <Link to="/shop" className="hover:text-[#B08D55] transition-colors">Shop</Link> <ChevronRight size={10} />
              <span className="text-gray-900 font-bold truncate max-w-[150px]">{product.name}</span>
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
              
              {/* Title & Reviews */}
              <div className="mb-6 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-[#B08D55]/10 text-[#B08D55] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Best Seller
                     </span>
                     <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Eye size={12} /> {viewCount} people viewing
                     </div>
                  </div>

                  <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1">
                        <div className="flex text-[#B08D55] gap-0.5">
                          {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                        </div>
                        <span className="text-xs font-medium text-gray-500 ml-1">(245 Reviews)</span>
                     </div>
                  </div>
              </div>

              {/* PRICE */}
              <div className="mb-6">
                 <div className="flex items-end gap-3 mb-1">
                    <span className="text-4xl font-heading font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                    {comparePrice > 0 && (
                       <span className="text-lg text-gray-400 line-through mb-1.5 font-light">₹{(comparePrice * quantity).toLocaleString()}</span>
                    )}
                    {comparePrice > 0 && (
                      <span className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded mb-2 shadow-sm">
                         -{Math.round(((comparePrice - comboPricePerUnit) / comparePrice) * 100)}%
                      </span>
                    )}
                 </div>
                 <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Order within <span className="text-gray-900 font-bold">{orderTimer.m}m {orderTimer.s}s</span> for dispatch today.
                 </p>
              </div>

              {/* COUPON */}
              <div className="mb-8 bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200">
                 <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <Ticket size={16} className="text-[#B08D55]" />
                        <div>
                          <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Extra ₹100 Off</p>
                          <p className="text-[10px] text-gray-500">Use code <span className="font-bold">WELCOME100</span> at checkout</p>
                        </div>
                     </div>
                     <button onClick={() => handleCopyCoupon('WELCOME100')} className="text-[10px] font-bold text-gray-900 underline hover:text-[#B08D55]">
                         {activeCoupon === 'WELCOME100' ? 'COPIED' : 'COPY'}
                     </button>
                 </div>
              </div>

              {/* QUANTITY */}
              <div className="mb-8">
                 <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Select Pack</span>
                 <div className="space-y-3">
                    {combos.map((combo) => (
                      <div 
                        key={combo.qty}
                        onClick={() => setQuantity(combo.qty)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          quantity === combo.qty 
                            ? 'border-[#B08D55] bg-[#B08D55]/5 shadow-sm ring-1 ring-[#B08D55]' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${quantity === combo.qty ? 'border-[#B08D55]' : 'border-gray-300'}`}>
                               {quantity === combo.qty && <div className="w-2 h-2 rounded-full bg-[#B08D55]" />}
                            </div>
                            <span className={`text-sm ${quantity === combo.qty ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                               {combo.label}
                            </span>
                         </div>
                         <span className="font-heading font-bold text-gray-900">₹{(comboPricePerUnit * combo.qty).toLocaleString()}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* ENERGIZATION */}
              <div className={`mb-8 border rounded-lg overflow-hidden transition-all duration-300 ${addEnergization ? 'border-[#B08D55] bg-white ring-1 ring-[#B08D55] shadow-lg' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                 <div 
                   onClick={() => setAddEnergization(!addEnergization)}
                   className="p-4 cursor-pointer flex items-center justify-between group relative overflow-hidden"
                 >
                    <div className="flex items-center gap-3 relative z-10">
                       <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${addEnergization ? 'bg-[#B08D55] text-white scale-110' : 'border border-gray-400 bg-white animate-gold-pulse'}`}>
                          {addEnergization ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-[#B08D55]/30"></div>}
                       </div>
                       <div>
                          <p className={`font-bold text-sm transition-colors flex items-center gap-2 ${addEnergization ? 'text-[#B08D55]' : 'text-gray-900'}`}>
                             Energize this Artifact <Sparkles size={14} className={addEnergization ? "text-[#B08D55] animate-spin-slow" : "text-gray-400"} />
                          </p>
                          <p className="text-[11px] text-gray-500">Vedic Pran Pratistha in your name</p>
                       </div>
                    </div>
                    <span className="text-sm font-bold text-[#B08D55] relative z-10">+₹{ENERGIZATION_COST}</span>
                    
                    {addEnergization && <div className="absolute inset-0 bg-[#B08D55]/5 z-0"></div>}
                 </div>

                 {addEnergization && (
                   <div className="px-4 pb-4 pt-0 animate-fade-in bg-white/50">
                      <input 
                        type="text" placeholder="Enter Name for Sankalp (e.g. Rahul Sharma)" 
                        className="w-full text-sm p-3 border border-gray-200 rounded-md focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none bg-white mt-3 transition-all shadow-inner"
                        value={devoteeName} onChange={(e) => setDevoteeName(e.target.value)}
                      />
                      <div className="mt-3 flex items-start gap-2 text-[11px] text-gray-600 bg-[#B08D55]/5 p-2 rounded border border-[#B08D55]/10">
                         <Gift size={14} className="text-[#B08D55] mt-0.5" />
                         <span>Bonus: You will receive <strong>Abhimantrit Ganga Jal</strong> & Video Proof with this order.</span>
                      </div>
                   </div>
                 )}
              </div>

              {/* ACTIONS */}
              <div ref={mainActionsRef} className="flex flex-col gap-3 mb-8">
                 <button 
                    onClick={() => handleDirectOrder('ONLINE')}
                    className="w-full py-4 bg-gray-900 text-white rounded-lg shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                 >
                    <div className="absolute inset-0 w-full h-full">
                       <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shine"></div>
                    </div>

                    <div className="flex flex-col items-center leading-none relative z-20">
                       <span className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-yellow-50">
                          Pay Online <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                       </span>
                       <span className="text-[10px] text-gray-300 mt-1 font-medium group-hover:text-[#B08D55] transition-colors">
                          Get Extra ₹{ONLINE_DISCOUNT} OFF • Fast Dispatch
                       </span>
                    </div>
                 </button>

                 <button 
                    onClick={() => handleDirectOrder('COD')}
                    className="w-full py-3.5 bg-white border border-gray-300 text-gray-900 font-bold text-xs uppercase tracking-widest rounded-lg hover:border-black hover:bg-gray-50 transition-all"
                 >
                    Cash on Delivery
                 </button>
              </div>

              {/* DELIVERY CHECKER */}
              <div className="mb-8 pt-6 border-t border-gray-100">
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Truck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                           type="text" maxLength={6} placeholder="Enter Pincode"
                           value={pincode} onChange={(e) => setPincode(e.target.value)}
                           className="w-full h-10 pl-10 pr-4 text-sm border-b border-gray-300 focus:border-black outline-none bg-transparent placeholder:text-gray-400"
                        />
                    </div>
                    <button onClick={checkDelivery} className="text-xs font-bold uppercase text-[#B08D55] hover:text-black transition-colors">
                       Check Date
                    </button>
                 </div>
                 {deliveryDate && (
                    <p className="text-xs text-green-700 mt-2 flex items-center gap-1.5 animate-fade-in">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Delivery by {deliveryDate}
                    </p>
                 )}
              </div>

              {/* DETAILED ACCORDIONS */}
              <div className="border-t border-gray-200">
                  {['Product Details', 'Shipping & Returns'].map((section, idx) => {
                     const key = section.split(' ')[0].toLowerCase();
                     const isOpen = key === 'product' ? openSections.details : openSections.shipping;
                     
                     return (
                      <div key={idx} className="border-b border-gray-200">
                         <button onClick={() => toggleSection(key === 'product' ? 'details' : 'shipping')} className="w-full py-4 flex items-center justify-between text-left group hover:bg-gray-50/50 transition-colors">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2">
                               {key === 'product' ? <Info size={16} /> : <Package size={16} />} {section}
                            </span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                         </button>
                         <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                            <div className="pb-6 text-sm text-gray-600 leading-relaxed px-1">
                               {key === 'product' ? (
                                 <>
                                   <p className="mb-4">The <strong>{product.name}</strong> is a sacred tool sourced directly from Varanasi. Consecrated by Vedic pundits, it carries immense spiritual significance.</p>
                                   <ul className="space-y-2">
                                      {["Original Lab Certified", "Natural Material", "Sourced from Nepal/Indonesia"].map((feat, i) => (
                                         <li key={i} className="flex items-center gap-2 text-gray-800 text-xs font-medium">
                                            <div className="w-1 h-1 bg-[#B08D55] rounded-full"></div> {feat}
                                         </li>
                                      ))}
                                   </ul>
                                 </>
                               ) : (
                                 <div className="space-y-2 text-xs">
                                    <p>• <strong>Dispatch:</strong> Within 24 hours of order.</p>
                                    <p>• <strong>Returns:</strong> 7-Day no-questions-asked return policy.</p>
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                     );
                  })}
              </div>
            </div>
          </div>

          {/* 4. RECOMMENDATIONS */}
          <div className="mt-20 border-t border-gray-200 pt-10 mb-10">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-heading text-2xl font-bold text-gray-900">You May Also Like</h3>
                <Link to="/shop" className="text-xs font-bold text-[#B08D55] uppercase tracking-widest hover:text-black transition-colors">View Collection</Link>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommendations.length > 0 ? recommendations.map((rec) => (
                   <Link key={rec.id} to={`/product/${rec.id}`} className="group block">
                      <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                         <img src={rec.featuredImageUrl} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                      </div>
                      <h4 className="font-heading font-bold text-gray-900 line-clamp-1 group-hover:text-[#B08D55] transition-colors">{rec.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">₹{rec.price}</p>
                   </Link>
                )) : (
                   <div className="col-span-4 text-center text-gray-400 text-sm italic py-8">More spiritual tools coming soon...</div>
                )}
             </div>
          </div>

        </div>

        {/* 5. STICKY BAR */}
        <div 
          className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 z-50 transition-transform duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:flex items-center gap-3 overflow-hidden">
               <img src={galleryImages[0]} alt="Product" className="w-10 h-10 rounded object-cover border border-gray-200" />
               <div>
                  <p className="font-heading font-bold text-sm text-gray-900 truncate max-w-[150px]">{product.name}</p>
                  <p className="text-xs font-bold text-[#B08D55]">₹{totalPrice.toLocaleString()}</p>
               </div>
            </div>
            <div className="flex gap-3 flex-1 md:flex-none md:w-auto">
               <button onClick={() => handleDirectOrder('COD')} className="flex-1 md:w-40 py-3 bg-white border border-gray-300 text-gray-900 text-[10px] md:text-xs font-bold uppercase rounded-md tracking-widest hover:bg-gray-50">COD</button>
               <button onClick={() => handleDirectOrder('ONLINE')} className="flex-[1.5] md:w-56 py-3 bg-black text-white text-[10px] md:text-xs font-bold uppercase rounded-md tracking-widest shadow-lg hover:bg-[#B08D55] transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 w-full h-full">
                     <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shine"></div>
                  </div>
                  Pay Online
               </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default ProductDetailsPage;