import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Search, Download, UserCheck, Mail } from 'lucide-react';

// FIX: Export name must match the import in AdminPage.jsx
export const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const uniqueMap = new Map();

      try {
        // 1. Get Paying Customers from Orders
        const orderSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        orderSnap.forEach(doc => {
          const data = doc.data();
          // Fallback to userEmail if shippingDetails is missing
          const email = data.shippingDetails?.email || data.userEmail;
          
          if (email) {
            if (!uniqueMap.has(email)) {
              uniqueMap.set(email, {
                id: email,
                name: data.shippingDetails?.firstName ? `${data.shippingDetails.firstName} ${data.shippingDetails.lastName}` : 'Guest',
                email: email,
                phone: data.shippingDetails?.phone || '-',
                ordersCount: 1,
                totalSpent: Number(data.totalAmount) || 0,
                lastOrderDate: data.createdAt?.toDate(),
                type: 'Customer'
              });
            } else {
              const existing = uniqueMap.get(email);
              existing.ordersCount += 1;
              existing.totalSpent += (Number(data.totalAmount) || 0);
              // Update name if we have a better one now
              if (existing.name === 'Guest' && data.shippingDetails?.firstName) {
                existing.name = `${data.shippingDetails.firstName} ${data.shippingDetails.lastName}`;
              }
            }
          }
        });

        // 2. Get Newsletter Subscribers
        const subSnap = await getDocs(collection(db, 'subscribers'));
        subSnap.forEach(doc => {
          const data = doc.data();
          if (data.email && !uniqueMap.has(data.email)) {
            uniqueMap.set(data.email, {
              id: doc.id,
              name: 'Subscriber',
              email: data.email,
              phone: '-',
              ordersCount: 0,
              totalSpent: 0,
              lastOrderDate: data.joinedAt?.toDate(),
              type: 'Subscriber'
            });
          }
        });

        setCustomers(Array.from(uniqueMap.values()));
      } catch (e) {
        console.error("Error fetching customers", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative w-full max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               value={search} 
               onChange={e => setSearch(e.target.value)} 
               type="text" 
               placeholder="Search by name or email..." 
               className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:border-[#B08D55] outline-none" 
             />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 mr-2">
                <strong>{customers.length}</strong> Total Contacts
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold uppercase transition-colors">
                <Download size={16}/> Export
            </button>
          </div>
       </div>

       {/* Table */}
       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                <tr>
                   <th className="p-4 pl-6">Customer</th>
                   <th className="p-4">Status</th>
                   <th className="p-4">Details</th>
                   <th className="p-4 text-center">Orders</th>
                   <th className="p-4 text-right pr-6">Total Spent</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {loading ? (
                   <tr><td colSpan="5" className="p-10 text-center text-gray-400">Loading customers...</td></tr>
                ) : filtered.length === 0 ? (
                   <tr><td colSpan="5" className="p-10 text-center text-gray-400">No customers found.</td></tr>
                ) : (
                 filtered.map((c, i) => (
                   <tr key={i} className="hover:bg-gray-50 group transition-colors">
                      <td className="p-4 pl-6">
                         <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${c.type === 'Customer' ? 'bg-[#B08D55]/10 text-[#B08D55]' : 'bg-gray-100 text-gray-500'}`}>
                                {c.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{c.name}</p>
                                <p className="text-xs text-gray-400">{c.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-4">
                         {c.type === 'Customer' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 text-[10px] font-bold uppercase border border-green-100">
                                <UserCheck size={12} /> Customer
                            </span>
                         ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase border border-gray-200">
                                <Mail size={12} /> Subscriber
                            </span>
                         )}
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                         {c.phone !== '-' ? c.phone : 'No Phone'}
                      </td>
                      <td className="p-4 text-center font-medium text-gray-900">
                         {c.ordersCount}
                      </td>
                      <td className="p-4 text-right pr-6 font-bold text-gray-900">
                         ₹{c.totalSpent.toLocaleString()}
                      </td>
                   </tr>
                ))
              )}
             </tbody>
          </table>
       </div>
    </div>
  );
};