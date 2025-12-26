import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { 
  DollarSign, ShoppingBag, Package, Users, ArrowUpRight, 
  Clock, TrendingUp, MoreHorizontal 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { formatPrice } from '@/lib/utils';

export const AdminDashboard = ({ onChangeTab }) => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Orders & Calculate Stats
      const ordersSnap = await getDocs(collection(db, 'orders'));
      let totalRev = 0;
      const uniqueCustomers = new Set();
      
      // Mock Data for Chart (Last 7 Days) - Real logic would aggregate by date
      const chartData = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { 
          date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), 
          sales: 0 
        };
      });

      ordersSnap.forEach(doc => {
        const data = doc.data();
        totalRev += (data.totalAmount || 0);
        if (data.userId) uniqueCustomers.add(data.userId);
        
        // Simple aggregation for chart
        if (data.createdAt) {
          const date = data.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          const dayStat = chartData.find(d => d.date === date);
          if (dayStat) dayStat.sales += data.totalAmount;
        }
      });

      // 2. Fetch Counts
      const productsSnap = await getDocs(collection(db, 'products'));

      // 3. Recent Orders
      const recentQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
      const recentSnap = await getDocs(recentQ);

      setStats({
        revenue: totalRev,
        orders: ordersSnap.size,
        products: productsSnap.size,
        customers: uniqueCustomers.size
      });
      setSalesData(chartData);
      setRecentOrders(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue" value={formatPrice(stats.revenue)} icon={DollarSign} trend="+12.5%" />
        <KpiCard title="Total Orders" value={stats.orders} icon={ShoppingBag} trend="+5.2%" />
        <KpiCard title="Active Products" value={stats.products} icon={Package} />
        <KpiCard title="Customers" value={stats.customers} icon={Users} trend="+8.1%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- SALES CHART --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Sales Overview</h3>
            <select className="bg-gray-50 border border-gray-200 text-xs rounded-md px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B08D55" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#B08D55" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#B08D55" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- ACTIVITY / QUICK ACTIONS --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3 flex-1">
             <button onClick={() => onChangeTab('products')} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center gap-3">
                <Package size={16} className="text-[#B08D55]" /> Add New Product
             </button>
             <button onClick={() => onChangeTab('orders')} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center gap-3">
                <ShoppingBag size={16} className="text-[#B08D55]" /> Process Orders
             </button>
             <button onClick={() => onChangeTab('storefront')} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center gap-3">
                <TrendingUp size={16} className="text-[#B08D55]" /> View Analytics
             </button>
          </div>
        </div>
      </div>

      {/* --- RECENT ORDERS --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <button onClick={() => onChangeTab('orders')} className="text-xs font-bold text-[#B08D55] hover:underline">View All</button>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 font-medium bg-white border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-normal">Order ID</th>
              <th className="px-6 py-3 font-normal">Date</th>
              <th className="px-6 py-3 font-normal">Customer</th>
              <th className="px-6 py-3 font-normal">Status</th>
              <th className="px-6 py-3 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-gray-600">#{order.id.slice(0,8)}</td>
                <td className="px-6 py-4 text-gray-500">
                  {order.createdAt?.toDate().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' : 
                      order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                      'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  {formatPrice(order.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper Component for Stats
const KpiCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-gray-50 rounded-md text-gray-500">
        <Icon size={20} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
          <ArrowUpRight size={12} className="mr-0.5" /> {trend}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-xs text-gray-500 mt-1">{title}</p>
  </div>
);