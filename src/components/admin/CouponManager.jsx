import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Ticket, Trash2, Plus, Percent, IndianRupee } from 'lucide-react';

export const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', minOrder: '', description: '' });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')), (snap) => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const createCoupon = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'coupons'), {
      ...form, 
      code: form.code.toUpperCase(),
      value: Number(form.value), 
      minOrder: Number(form.minOrder),
      createdAt: serverTimestamp(),
      isActive: true
    });
    setForm({ code: '', type: 'percent', value: '', minOrder: '', description: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
       {/* Creator Card */}
       <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Ticket className="text-[#B08D55]"/> Create Discount</h2>
          <form onSubmit={createCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Coupon Code</label>
                <input required placeholder="e.g. WELCOME10" className="w-full border p-3 rounded-lg font-mono font-bold uppercase text-lg" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
             </div>
             <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Type</label>
                   <select className="w-full border p-3 rounded-lg bg-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="percent">Percentage %</option><option value="fixed">Fixed ₹</option></select>
                </div>
                <div>
                   <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Value</label>
                   <input required type="number" placeholder="10" className="w-full border p-3 rounded-lg" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
                </div>
             </div>
             <div className="col-span-2">
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Description</label>
                <input required placeholder="For new customers..." className="w-full border p-3 rounded-lg" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
             </div>
             <button className="col-span-2 bg-black text-white py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Create Active Coupon</button>
          </form>
       </div>

       {/* Active List */}
       <div className="space-y-4">
          <h3 className="font-bold text-gray-400 text-sm uppercase tracking-widest">Active Discounts</h3>
          {coupons.map(c => (
             <div key={c.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                      {c.type === 'percent' ? <Percent size={20}/> : <IndianRupee size={20}/>}
                   </div>
                   <div>
                      <h4 className="text-lg font-bold font-mono text-gray-900 tracking-wide">{c.code}</h4>
                      <p className="text-sm text-gray-500">{c.description} • Min Order: ₹{c.minOrder}</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className="text-xl font-bold text-gray-900">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</span>
                   <button onClick={async() => { if(confirm('Delete?')) await deleteDoc(doc(db, 'coupons', c.id)) }} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};