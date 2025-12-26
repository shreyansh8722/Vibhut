import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { Search, Plus, Minus, AlertCircle, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const updateStock = async (id, amount) => {
    try {
        await updateDoc(doc(db, 'products', id), { stock: increment(amount) });
        toast.success("Stock updated");
    } catch(e) { toast.error("Update failed"); }
  };

  const filtered = products.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-10rem)] animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><PackageCheck className="text-[#B08D55]" /> Inventory</h3>
          <p className="text-xs text-gray-500 mt-1">Real-time stock management</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search SKU or Name..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#B08D55]" onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left text-sm">
           <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase sticky top-0">
              <tr>
                 <th className="p-4 pl-6">Product</th>
                 <th className="p-4">SKU</th>
                 <th className="p-4">Price</th>
                 <th className="p-4 text-center">Current Stock</th>
                 <th className="p-4 text-center">Adjust</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
             {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                   <td className="p-4 pl-6 flex items-center gap-3">
                      <img src={p.featuredImageUrl} className="w-10 h-10 rounded border object-cover bg-gray-100" />
                      <span className="font-medium text-gray-900">{p.name}</span>
                   </td>
                   <td className="p-4 text-gray-500 font-mono text-xs">{p.sku || '-'}</td>
                   <td className="p-4 text-gray-900">₹{p.price}</td>
                   <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded font-bold ${p.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-800'}`}>
                         {p.stock}
                      </span>
                   </td>
                   <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <button onClick={() => updateStock(p.id, -1)} className="p-1.5 border rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"><Minus size={14}/></button>
                         <button onClick={() => updateStock(p.id, 1)} className="p-1.5 border rounded hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"><Plus size={14}/></button>
                      </div>
                   </td>
                </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};