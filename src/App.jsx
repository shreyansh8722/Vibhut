import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// --- PROVIDERS ---
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';

// --- COMPONENTS ---
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartModal from './components/shop/CartModal';

// --- PAGES ---
import Home from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import ConsultPage from './pages/ConsultPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage'; // <--- IMPORT THIS

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          
          <div className="flex flex-col min-h-screen">
            <ScrollToTop />
            
            <Navbar />
            <CartModal />

            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/consult" element={<ConsultPage />} />
                
                {/* Auth Routes */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* ADMIN ROUTE - CONNECTED */}
                <Route path="/admin" element={<AdminPage />} />
                
                <Route path="*" element={<div>404 Not Found</div>} />
              </Routes>
            </main>

            <Footer />
          </div>

        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;