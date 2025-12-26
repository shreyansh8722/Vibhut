import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Truck, ChevronLeft, CreditCard, 
  Banknote, AlertCircle, CheckCircle2 
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop');
    }
  }, [cartItems, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // Default to Online
  const [isProcessing, setIsProcessing] = useState(false);

  // Totals Logic
  const shippingCost = cartTotal > 499 ? 0 : 99; // Free shipping logic
  const codFee = paymentMethod === 'COD' ? 49 : 0; // Extra fee for COD
  const finalTotal = cartTotal + shippingCost + codFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // SIMULATE API CALL
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      // Navigate to Success Page (We will build this next)
      alert("Order Placed Successfully! (This is a demo)");
      navigate('/'); 
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-body text-black">
      
      {/* 1. Distraction-Free Header */}
      <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo className="h-6 md:h-8 w-auto text-[var(--color-primary)]" />
          </Link>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <Lock size={12} /> Secure Checkout
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          
          {/* LEFT COLUMN: FORM */}
          <div className="w-full lg:w-[60%]">
            <form onSubmit={handlePlaceOrder} className="flex flex-col gap-8">
              
              {/* Contact Info */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <input 
                    type="email" name="email" required
                    placeholder="Email Address"
                    value={formData.email} onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded focus:border-black focus:bg-white outline-none transition-colors text-sm"
                  />
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <AlertCircle size={14} className="mt-0.5 text-[var(--color-primary)]" />
                    We'll send the order confirmation and tracking details here.
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">2</span>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" name="firstName" required placeholder="First Name"
                    className="p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none text-sm"
                    value={formData.firstName} onChange={handleInputChange}
                  />
                  <input 
                    type="text" name="lastName" required placeholder="Last Name"
                    className="p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none text-sm"
                    value={formData.lastName} onChange={handleInputChange}
                  />
                  <input 
                    type="text" name="address" required placeholder="Address (House No, Building, Street)"
                    className="md:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none text-sm"
                    value={formData.address} onChange={handleInputChange}
                  />
                  <input 
                    type="text" name="apartment" placeholder="Apartment, suite, etc. (optional)"
                    className="md:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none text-sm"
                    value={formData.apartment} onChange={handleInputChange}
                  />
                  <input 
                    type="text" name="pincode" required placeholder="Pincode" maxLength={6}
                    className="p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none text-sm"
                    value={formData.pincode} onChange={handleInputChange}
                  />
                  <input 
                    type="text" name="city" required placeholder="City"
                    className="p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none text-sm"
                    value={formData.city} onChange={handleInputChange}
                  />
                  <input 
                    type="text" name="state" required placeholder="State"
                    className="p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none text-sm"
                    value={formData.state} onChange={handleInputChange}
                  />
                  <input 
                    type="tel" name="phone" required placeholder="Phone Number" maxLength={10}
                    className="p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none text-sm"
                    value={formData.phone} onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">3</span>
                  Payment Method
                </h2>
                
                <div className="flex flex-col gap-3">
                  {/* Option 1: Online */}
                  <label className={`relative flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-[var(--color-primary)] bg-orange-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="radio" name="payment" value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="accent-[var(--color-primary)] w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">Pay Online (UPI / Cards / NetBanking)</span>
                        <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded uppercase">Fast Dispatch</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Save ₹49 COD fee + Get Priority Processing</p>
                    </div>
                    <CreditCard className="text-gray-400" />
                  </label>

                  {/* Option 2: COD */}
                  <label className={`relative flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[var(--color-primary)] bg-orange-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="radio" name="payment" value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-[var(--color-primary)] w-5 h-5"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm block">Cash on Delivery</span>
                      <p className="text-xs text-gray-500 mt-1">Pay comfortably at your doorstep. ₹49 handling fee applies.</p>
                    </div>
                    <Banknote className="text-gray-400" />
                  </label>
                </div>
              </div>

              {/* Mobile Only: Place Order Button (Bottom Fixed) */}
              <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 z-40 shadow-xl">
                 <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-4 rounded font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors disabled:bg-gray-400"
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${finalTotal.toLocaleString()}`}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="w-full lg:w-[40%]">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-6">Order Summary</h2>
              
              {/* Product List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-0 -right-0 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-black line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.variant}</p>
                    </div>
                    <div className="text-sm font-bold">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-3 py-6 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-bold">Free</span>
                  ) : (
                    <span>₹{shippingCost}</span>
                  )}
                </div>
                {paymentMethod === 'COD' && (
                  <div className="flex justify-between text-sm text-gray-600 animate-fade-in">
                    <span>COD Handling Fee</span>
                    <span>₹{codFee}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-6 border-t border-gray-100 mb-6">
                <span className="font-heading text-xl font-bold">Total</span>
                <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">
                  ₹{finalTotal.toLocaleString()}
                </span>
              </div>

              {/* Place Order Button (Desktop) */}
              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="hidden lg:block w-full bg-black text-white py-4 rounded font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors shadow-lg disabled:bg-gray-400"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                   <ShieldCheck size={16} className="text-green-600" /> Secure Payment
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                   <Truck size={16} className="text-[var(--color-primary)]" /> Fast Delivery
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;