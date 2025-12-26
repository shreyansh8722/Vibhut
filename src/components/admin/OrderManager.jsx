import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, query, orderBy, limit, getDocs, updateDoc, doc, 
  serverTimestamp, where, getDoc 
} from 'firebase/firestore';
import { 
  Truck, CheckCircle, XCircle, Search, Eye, Printer, 
  Filter, Calendar, MapPin, Package, CreditCard 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { printInvoice } from './InvoiceGenerator'; 

export const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unfulfilled', 'delivered'
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [shippingModal, setShippingModal] = useState({ open: false, orderId: null });
  const [trackingInfo, setTrackingInfo] = useState({ courier: 'Delhivery', trackingId: '', url: '' });

  // --- FETCH ORDERS ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
      
      // Simple client-side filtering for demo (Firestore compound queries require indexes)
      // In production, you'd use specific indexes: where('status', '==', 'Pending')
      const snap = await getDocs(q);
      const allData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (activeTab === 'unfulfilled') {
        setOrders(allData.filter(o => ['Pending', 'Processing'].includes(o.status)));
      } else if (activeTab === 'delivered') {
        setOrders(allData.filter(o => o.status === 'Delivered'));
      } else {
        setOrders(allData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // --- ACTIONS ---
  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status });
    fetchOrders();
    if (selectedOrder) setSelectedOrder(prev => ({ ...prev, status }));
  };

  const handleShipOrder = async () => {
    if (!shippingModal.orderId) return;
    await updateDoc(doc(db, 'orders', shippingModal.orderId), {
      status: 'Shipped',
      tracking: trackingInfo,
      shippedAt: serverTimestamp()
    });
    setShippingModal({ open: false, orderId: null });
    fetchOrders();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* --- TOP CONTROLS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
           {['all', 'unfulfilled', 'delivered'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                 activeTab === tab ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
        <div className="flex gap-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Filter orders..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#B08D55]" />
           </div>
           <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50"><Filter size={18} /></button>
        </div>
      </div>

      {/* --- ORDERS TABLE --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                 <th className="p-4 pl-6">Order</th>
                 <th className="p-4">Date</th>
                 <th className="p-4">Customer</th>
                 <th className="p-4">Payment</th>
                 <th className="p-4">Fulfillment</th>
                 <th className="p-4 text-right">Total</th>
                 <th className="p-4 text-center">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                   <td className="p-4 pl-6 font-mono font-bold text-gray-700">#{order.id.slice(0,6)}</td>
                   <td className="p-4 text-gray-500">{order.createdAt?.toDate().toLocaleDateString()}</td>
                   <td className="p-4 font-medium">{order.shippingDetails?.firstName} {order.shippingDetails?.lastName}</td>
                   <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                         order.paymentStatus === 'Paid' ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                      }`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-gray-500' : 'bg-yellow-500'}`} />
                         {order.paymentStatus || 'Pending'}
                      </span>
                   </td>
                   <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                         order.status === 'Delivered' ? 'bg-green-50 border-green-100 text-green-700' :
                         order.status === 'Shipped' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                         'bg-yellow-50 border-yellow-100 text-yellow-700'
                      }`}>
                         {order.status}
                      </span>
                   </td>
                   <td className="p-4 text-right font-medium">₹{order.totalAmount?.toLocaleString()}</td>
                   <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-900"><Eye size={18}/></button>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>

      {/* --- ORDER DETAIL DRAWER --- */}
      <AnimatePresence>
         {selectedOrder && (
           <div className="fixed inset-0 z-[60] flex justify-end">
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
              <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'tween', duration:0.3}} className="relative w-full max-w-2xl bg-gray-50 h-full shadow-2xl overflow-y-auto">
                 
                 {/* Header */}
                 <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                    <div>
                       <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">#{selectedOrder.id.slice(0,8)} <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded border">{selectedOrder.createdAt?.toDate().toLocaleString()}</span></h2>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => printInvoice(selectedOrder)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold uppercase hover:bg-gray-50">
                          <Printer size={16}/> Invoice
                       </button>
                       <button onClick={() => setSelectedOrder(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><XCircle size={20}/></button>
                    </div>
                 </div>

                 <div className="p-6 space-y-6">
                    {/* Products Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                       <div className="p-4 border-b border-gray-100 font-bold text-sm bg-gray-50/50 flex items-center gap-2"><Package size={16}/> Items ({selectedOrder.items?.length})</div>
                       <div className="divide-y divide-gray-100">
                          {selectedOrder.items?.map((item, i) => (
                             <div key={i} className="p-4 flex gap-4">
                                <img src={item.image} className="w-16 h-16 object-cover rounded bg-gray-100 border" />
                                <div className="flex-1">
                                   <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                   <p className="text-xs text-gray-500">Var: {item.selectedOptions?.size || 'Standard'}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-sm font-medium">₹{item.price} x {item.quantity}</p>
                                   <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                       <div className="p-4 bg-gray-50 border-t border-gray-200 text-right space-y-1">
                          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{selectedOrder.totalAmount}</span></div>
                          <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span>₹0.00</span></div>
                          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200 mt-2"><span>Total</span><span>₹{selectedOrder.totalAmount}</span></div>
                       </div>
                    </div>

                    {/* Customer & Shipping */}
                    <div className="grid grid-cols-2 gap-6">
                       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16}/> Shipping Address</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                             {selectedOrder.shippingDetails?.firstName} {selectedOrder.shippingDetails?.lastName}<br/>
                             {selectedOrder.shippingDetails?.address}<br/>
                             {selectedOrder.shippingDetails?.city}, {selectedOrder.shippingDetails?.state} - {selectedOrder.shippingDetails?.pincode}<br/>
                             IN
                          </p>
                       </div>
                       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2"><CreditCard size={16}/> Customer</h3>
                          <p className="text-sm text-blue-600 mb-1">{selectedOrder.shippingDetails?.email}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.shippingDetails?.phone}</p>
                          <div className="mt-4 pt-3 border-t border-gray-100">
                             <h4 className="text-xs font-bold text-gray-400 uppercase">Payment Method</h4>
                             <p className="text-sm font-medium mt-1">Cash on Delivery (COD)</p>
                          </div>
                       </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                       <h3 className="font-bold text-sm text-gray-900 mb-3">Order Actions</h3>
                       <div className="flex flex-wrap gap-3">
                          {selectedOrder.status !== 'Shipped' && selectedOrder.status !== 'Delivered' && (
                             <button onClick={() => { setShippingModal({ open: true, orderId: selectedOrder.id }); }} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-gray-800 flex items-center gap-2"><Truck size={16}/> Mark as Shipped</button>
                          )}
                          {selectedOrder.status === 'Shipped' && (
                             <button onClick={() => updateStatus(selectedOrder.id, 'Delivered')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-green-700 flex items-center gap-2"><CheckCircle size={16}/> Mark Delivered</button>
                          )}
                          <button onClick={() => updateStatus(selectedOrder.id, 'Cancelled')} className="px-4 py-2 rounded-lg text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50">Cancel Order</button>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Shipping Modal */}
      {shippingModal.open && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-2xl">
               <h3 className="text-lg font-bold mb-4">Fulfill Items</h3>
               <div className="space-y-3">
                  <input className="w-full border p-2 rounded text-sm" placeholder="Tracking Number" value={trackingInfo.trackingId} onChange={e => setTrackingInfo({...trackingInfo, trackingId: e.target.value})} />
                  <select className="w-full border p-2 rounded text-sm bg-white" value={trackingInfo.courier} onChange={e => setTrackingInfo({...trackingInfo, courier: e.target.value})}>
                     <option>Delhivery</option><option>BlueDart</option><option>DTDC</option><option>XpressBees</option>
                  </select>
                  <button onClick={handleShipOrder} className="w-full bg-[#B08D55] text-white py-3 rounded font-bold uppercase text-xs mt-2">Fulfill Order</button>
                  <button onClick={() => setShippingModal({open:false, orderId:null})} className="w-full text-gray-500 py-2 text-xs">Cancel</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};