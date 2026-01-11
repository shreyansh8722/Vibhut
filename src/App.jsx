import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// --- EAGER COMPONENTS ---
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartModal from './components/shop/CartModal';
import { AppSkeleton } from './components/skeletons/AppSkeleton';
import WhatsAppButton from './components/common/WhatsAppButton'; 
import Home from './pages/HomePage'; 

// --- LAZY COMPONENTS ---
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ConsultPage = lazy(() => import('./pages/ConsultPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// IMPORT THE NEW PAGE
const KundaliPage = lazy(() => import('./pages/KundaliPage'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function App() {
  const location = useLocation();
  const isCheckoutPage = location.pathname === '/checkout';

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-gray-900">
      <ScrollToTop />
      
      {!isCheckoutPage && <Navbar />}
      
      <CartModal />

      <main className="flex-grow relative min-h-screen">
        <Suspense fallback={<AppSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/consult" element={<ConsultPage />} />
            
            {/* NEW ROUTE */}
            <Route path="/kundali" element={<KundaliPage />} />
            
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<div className="p-20 text-center">Page Not Found</div>} />
          </Routes>
        </Suspense>
      </main>
      
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

export default App;