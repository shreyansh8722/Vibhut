import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, CreditCard, Banknote, AlertCircle, Loader2, ShieldCheck, ChevronRight 
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

// --- FIREBASE IMPORTS ---
import { db } from '../lib/firebase';
import { 
  collection, addDoc, serverTimestamp, writeBatch, 
  doc, increment, getDoc 
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [checkoutItems, setCheckoutItems] = useState([]);

  // --- 1. DETERMINE CHECKOUT ITEMS ---
  // If navigated with state.directPurchase, use that. Otherwise use Cart.
  useEffect(() => {
    if (location.state?.directPurchase) {
      setCheckoutItems(location.state.directPurchase);
    } else {
      setCheckoutItems(cartItems || []);
    }
  }, [location.state, cartItems]);

  // Redirect if NO items at all
  useEffect(() => {
    // Only redirect if both are empty (and we've had a chance to load)
    if ((!cartItems || cartItems.length === 0) && (!location.state?.directPurchase)) {
       // A small timeout to prevent flicker on reload
       const timer = setTimeout(() => navigate('/shop'), 100);
       return () => clearTimeout(timer);
    }
  }, [cartItems, location.state, navigate]);

  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', address: '',
    apartment: '', city: '', state: '', pincode: '', phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState(location.state?.paymentMode || 'ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 2. CALCULATE TOTALS (Fix for Energization) ---
  const ENERGIZATION_COST = 151;

  const safeTotal = checkoutItems.reduce((acc, item) => {
    const itemTotal = (Number(item.price || 0) * Number(item.quantity || 1));
    // If the item has energization enabled, add the cost
    const energization = item.energization ? ENERGIZATION_COST : 0;
    return acc + itemTotal + energization;
  }, 0);
  
  const shippingCost = safeTotal > 499 ? 0 : 99;
  const codFee = paymentMethod === 'COD' ? 49 : 0;
  const finalTotal = safeTotal + shippingCost + codFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkStockAvailability = async (items) => {
    for (const item of items) {
      try {
        const docRef = doc(db, 'products', item.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return { valid: false, error: `Product "${item.name}" is no longer available.` };
        }

        const realStock = docSnap.data().stock || 0;
        if (realStock < item.quantity) {
          return { valid: false, error: `Sorry, "${item.name}" is out of stock (Only ${realStock} left).` };
        }
      } catch (error) {
        console.error("Stock check error:", error);
        return { valid: false, error: "System error checking stock. Please try again." };
      }
    }
    return { valid: true };
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const stockStatus = await checkStockAvailability(checkoutItems);

      if (!stockStatus.valid) {
        setIsProcessing(false);
        toast.error(stockStatus.error);
        return;
      }

      const orderData = {
        items: checkoutItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant || 'Standard',
          image: item.featuredImageUrl || item.image || '',
          energization: item.energization || false, // Save this detail
          energizationDetails: item.energizationDetails || null
        })),
        totalAmount: finalTotal,
        subtotal: safeTotal,
        shippingCost,
        codFee,
        shippingDetails: formData,
        paymentMethod: paymentMethod,
        status: 'Pending',
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        createdAt: serverTimestamp(),
        userEmail: formData.email,
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Reduce Stock
      const batch = writeBatch(db);
      checkoutItems.forEach((item) => {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, { 
          stock: increment(-item.quantity) 
        });
      });
      await batch.commit();

      setIsProcessing(false);
      
      // --- CRITICAL FIX: Only clear cart if it wasn't a direct buy ---
      if (!location.state?.directPurchase) {
        clearCart();
      }
      
      toast.success("Order Placed Successfully!");
      navigate('/order-success'); 

    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded text-sm outline-none transition-all focus:bg-white focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55]";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo className="h-6 md:h-8 w-auto text-[#B08D55]" />
          </Link>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-[#B08D55] bg-orange-50 px-4 py-1.5 rounded-full border border-[#B08D55]/20">
            <Lock size={12} /> Secure Checkout
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        
        {/* Standard Breadcrumbs */}
        <div className="max-w-6xl mx-auto mb-8 flex items-center gap-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">
          <Link to="/" className="hover:text-[#B08D55] transition-colors">Home</Link> 
          <ChevronRight size={10} />
          <Link to="/shop" className="hover:text-[#B08D55] transition-colors">Shop</Link> 
          <ChevronRight size={10} />
          <span className="text-gray-900">Checkout</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-6xl mx-auto">
          
          {/* LEFT COLUMN: FORM */}
          <div className="w-full lg:w-[60%]">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
              
              {/* Contact Info */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="font-heading text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                  <span className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-sm font-sans">1</span>
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <input type="email" name="email" required placeholder="Email Address" value={formData.email} onChange={handleInputChange} className={inputClass} />
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <AlertCircle size={14} className="mt-0.5 text-[#B08D55]" />
                    We'll send the order confirmation and tracking details here.
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="font-heading text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                  <span className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-sm font-sans">2</span>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="firstName" required placeholder="First Name" className={inputClass} value={formData.firstName} onChange={handleInputChange} />
                  <input type="text" name="lastName" required placeholder="Last Name" className={inputClass} value={formData.lastName} onChange={handleInputChange} />
                  <input type="text" name="address" required placeholder="Address" className={`md:col-span-2 ${inputClass}`} value={formData.address} onChange={handleInputChange} />
                  <input type="text" name="city" required placeholder="City" className={inputClass} value={formData.city} onChange={handleInputChange} />
                  <input type="text" name="state" required placeholder="State" className={inputClass} value={formData.state} onChange={handleInputChange} />
                  <input type="text" name="pincode" required placeholder="Pincode" maxLength={6} className={inputClass} value={formData.pincode} onChange={handleInputChange} />
                  <input type="tel" name="phone" required placeholder="Phone Number" maxLength={10} className={inputClass} value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="font-heading text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                  <span className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-sm font-sans">3</span>
                  Payment Method
                </h2>
                <div className="flex flex-col gap-3">
                  <label className={`relative flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-[#B08D55] bg-orange-50/30 ring-1 ring-[#B08D55]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} className="accent-[#B08D55] w-5 h-5" />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-gray-900">Pay Online</span>
                      <p className="text-xs text-gray-500 mt-0.5">UPI, Cards, Netbanking (Fastest)</p>
                    </div>
                    <CreditCard className={paymentMethod === 'ONLINE' ? "text-[#B08D55]" : "text-gray-400"} />
                  </label>

                  <label className={`relative flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#B08D55] bg-orange-50/30 ring-1 ring-[#B08D55]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-[#B08D55] w-5 h-5" />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-gray-900">Cash on Delivery</span>
                      <p className="text-xs text-gray-500 mt-0.5">Additional ₹49 Handling Fee</p>
                    </div>
                    <Banknote className={paymentMethod === 'COD' ? "text-[#B08D55]" : "text-gray-400"} />
                  </label>
                </div>
              </div>

              {/* Mobile Pay Button */}
              <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                 <button type="submit" disabled={isProcessing} className="w-full bg-black text-white py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-[#B08D55] transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2">
                  {isProcessing ? <Loader2 className="animate-spin" size={18}/> : `Pay ₹${finalTotal.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="w-full lg:w-[40%]">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 sticky top-24">
              <div className="mb-6">
                <h2 className="font-heading text-xl font-bold text-gray-900">Order Summary</h2>
                <div className="w-16 h-1 bg-[#B08D55] rounded-full mt-2"></div>
              </div>

              <div className="space-y-5 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    {/* CLICKABLE IMAGE LINK */}
                    <Link to={`/product/${item.id}`} className="block w-16 h-20 flex-shrink-0">
                      <div className="w-full h-full bg-gray-100 rounded-md border border-gray-200 overflow-hidden relative">
                        <img src={item.featuredImageUrl || item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl font-bold">{item.quantity}</span>
                      </div>
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`} className="hover:text-[#B08D55] transition-colors">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{item.name}</h4>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{item.variant || 'Standard'}</p>
                      
                      {/* SHOW ENERGIZATION TAG IF APPLICABLE */}
                      {item.energization && (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-[#B08D55]/10 text-[#B08D55] text-[9px] font-bold uppercase">
                          <CheckCircle2 size={10} /> Energized (+₹151)
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      ₹{((Number(item.price) * Number(item.quantity)) + (item.energization ? 151 : 0)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-t border-dashed border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{safeTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  {shippingCost === 0 ? <span className="text-green-700 font-bold text-xs uppercase bg-green-50 px-2 py-0.5 rounded">Free</span> : <span className="font-medium text-gray-900">₹{shippingCost}</span>}
                </div>
                {paymentMethod === 'COD' && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>COD Handling</span>
                    <span className="font-medium text-gray-900">₹{codFee}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center py-6 border-t border-gray-200 mb-6">
                <span className="font-heading text-xl font-bold text-gray-900">Total</span>
                <span className="font-heading text-2xl font-bold text-[#B08D55]">₹{finalTotal.toLocaleString()}</span>
              </div>

              <button form="checkout-form" type="submit" disabled={isProcessing} className="hidden lg:flex w-full bg-black text-white py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-[#B08D55] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:bg-gray-400 items-center justify-center gap-2">
                {isProcessing ? <><Loader2 className="animate-spin" size={18}/> Processing...</> : 'Place Order'}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                 <ShieldCheck size={14} /> SSL Encrypted Transaction
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;