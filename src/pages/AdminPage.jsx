import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Users, FileText, 
  Settings, LogOut, Menu, Bell, Search,
  ChevronRight, Home, BarChart3, Tag, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ProductManager } from '../components/admin/ProductManager';
import { useNavigate } from 'react-router-dom';

// Import other managers if you have them, or use placeholders
// import { OrderManager } from '../components/admin/OrderManager'; 

export const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Redirect if not admin (Basic protection)
  if (!user || user.role !== 'admin') {
     return <div className="p-10 text-center">Access Denied. <button onClick={() => navigate('/login')} className="underline">Login</button></div>;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: FileText },
    { id: 'products', label: 'Products', icon: Tag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'content', label: 'Content', icon: ImageIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F1F2F4] font-sans">
      
      {/* --- SIDEBAR (Shopify Style) --- */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#1A1A1A] text-[#E3E3E3] transition-all duration-300 flex flex-col flex-shrink-0 z-50`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 bg-[#2C2C2C] border-b border-[#444]">
           <div className="w-8 h-8 bg-[#B08D55] rounded-md flex items-center justify-center font-bold text-white shrink-0">
             V
           </div>
           {isSidebarOpen && <span className="ml-3 font-bold tracking-wide">Vishwanatham</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium transition-colors border-l-4 ${
                activeTab === item.id 
                  ? 'bg-[#303030] border-[#B08D55] text-white' 
                  : 'border-transparent hover:bg-[#303030] text-[#A1A1A1]'
              }`}
            >
              <item.icon size={20} strokeWidth={1.5} />
              {isSidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-[#444] bg-[#2C2C2C]">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs font-bold text-white">
                {user.email?.[0].toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium truncate text-white">{user.email}</p>
                   <button onClick={logout} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mt-1">
                     <LogOut size={12} /> Sign out
                   </button>
                </div>
              )}
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-40">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-bold text-gray-800 capitalize">{activeTab}</h1>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search store..." 
                   className="pl-9 pr-4 py-1.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 rounded-md text-sm outline-none transition-all w-64 border"
                 />
              </div>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
           </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
           <div className="max-w-6xl mx-auto">
              {activeTab === 'products' && <ProductManager />}
              {activeTab === 'dashboard' && (
                 <div className="p-10 text-center text-gray-500">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back, {user.email}</h2>
                    <p>Select "Products" from the sidebar to manage your store.</p>
                 </div>
              )}
              {/* Add other components here */}
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;