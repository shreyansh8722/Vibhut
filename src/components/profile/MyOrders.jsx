import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, writeBatch, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, Clock, CheckCircle2, XCircle, Truck, ExternalLink, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function MyOrders({ userId }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH ORDERS ---
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data(),
         createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // --- ACTIONS ---
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      // 1. Get order details to know what to restock
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        toast.error("Order not found");
        return;
      }

      const orderData = orderSnap.data();
      const batch = writeBatch(db);

      // 2. Update Order Status
      batch.update(orderRef, {
        status: 'Cancelled',
        cancelledAt: new Date()
      });

      // 3. Restore Stock for each item
      if (orderData.items && Array.isArray(orderData.items)) {
        orderData.items.forEach(item => {
            const productRef = doc(db, 'products', item.id);
            batch.update(productRef, { 
                stock: increment(item.quantity) 
            });
        });
      }

      await batch.commit();
      toast.success("Order cancelled and stock restored");
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel. Please contact support.");
    }
  };

  const handleExchange = (orderId) => {
    const msg = `Hi Pahnawa Team, I would like to exchange/return items from Order ID: ${orderId}`;
    window.open(`https://wa.me/919305491919?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- STATUS BADGE HELPER ---
  const getStatusInfo = (status) => {
    const s = (status || 'processing').toLowerCase();
    if (s.includes('deliver')) return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2, label: 'Delivered' };
    if (s.includes('ship') || s.includes('dispatch')) return { color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck, label: 'In Transit' };
    if (s.includes('cancel')) return { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle, label: 'Cancelled' };
    return { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock, label: 'Processing' };
  };

  if (loading) return <div className="text-center py-20 text-xs uppercase tracking-widest text-stone-400">Loading your collection...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-stone-200 bg-stone-50/50">
        <Package size={40} strokeWidth={1} className="text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-serif text-stone-900 mb-2 italic">No Orders Yet</h3>
        <button 
          onClick={() => navigate('/shop')}
          className="mt-4 text-xs font-bold uppercase tracking-widest text-heritage-gold border-b border-heritage-gold pb-1 hover:text-heritage-charcoal hover:border-heritage-charcoal transition-all"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => {
        const { color, bg, icon: StatusIcon, label } = getStatusInfo(order.status);
        const canCancel = ['Processing', 'Pending'].includes(order.status || 'Processing');
        const isDelivered = (order.status || '').toLowerCase().includes('delivered');

        return (
          <div key={order.id} className="group bg-white border border-stone-200 rounded-sm hover:border-heritage-gold/30 transition-all duration-500 overflow-hidden">
            
            {/* HEADER */}
            <div className="px-6 py-4 bg-stone-50/50 border-b border-stone-100 flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-6 text-xs text-stone-500">
                <div>
                  <span className="block uppercase tracking-widest text-[9px] text-stone-400 mb-1">Order Placed</span>
                  <span className="font-medium text-stone-900">{order.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="block uppercase tracking-widest text-[9px] text-stone-400 mb-1">Total</span>
                  <span className="font-medium text-stone-900">₹{formatPrice(order.totalAmount || order.total)}</span>
                </div>
                <div>
                  <span className="block uppercase tracking-widest text-[9px] text-stone-400 mb-1">Order ID</span>
                  <span className="font-medium text-stone-900">#{order.id.slice(-8).toUpperCase()}</span>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${bg} ${color}`}>
                <StatusIcon size={12} /> {label}
              </div>
            </div>

            {/* BODY */}
            <div className="p-6">
              <div className="flex flex-col gap-6">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-start">
                    <div className="w-20 h-24 bg-stone-100 border border-stone-200 shrink-0">
                      <img 
                        src={item.featuredImageUrl || item.image || '/placeholder.jpg'} 
                        alt={item.name} 
                        className="w-full h-full object-cover mix-blend-multiply" 
                      />
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-serif text-lg text-heritage-charcoal leading-tight mb-2">
                        <span onClick={() => navigate(`/product/${item.id}`)} className="cursor-pointer hover:text-heritage-gold transition-colors">
                          {item.name}
                        </span>
                      </h4>
                      <p className="text-xs text-stone-500 font-sans mb-1">
                        Size: <span className="text-stone-800">{item.selectedSize || 'Standard'}</span> 
                        <span className="mx-2 text-stone-300">|</span> 
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-heritage-charcoal">₹{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap gap-4 justify-end">
                
                {/* 1. Track Order */}
                {!label.includes('Cancelled') && (
                  <button 
                    onClick={() => navigate('/track-order', { state: { orderId: order.id } })}
                    className="flex items-center gap-2 px-5 py-2.5 border border-stone-200 text-stone-600 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-stone-50 hover:text-stone-900 transition-colors"
                  >
                    <Truck size={14} /> Track Order
                  </button>
                )}

                {/* 2. Cancel Order */}
                {canCancel && (
                  <button 
                    onClick={() => handleCancelOrder(order.id)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={14} /> Cancel Order
                  </button>
                )}

                {/* 3. Exchange/Return */}
                {isDelivered && (
                  <button 
                    onClick={() => handleExchange(order.id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-heritage-gold border border-transparent transition-colors shadow-sm"
                  >
                    <RefreshCw size={14} /> Exchange / Return
                  </button>
                )}

                {/* 4. Need Help */}
                <button 
                  onClick={() => handleExchange(order.id)} 
                  className="flex items-center gap-2 px-5 py-2.5 text-stone-400 hover:text-stone-600 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors"
                >
                  Need Help?
                </button>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}