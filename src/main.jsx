import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// FIX: Import AuthProvider from HOOKS, not context
import { AuthProvider } from './hooks/useAuth'; 
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { LoginModalProvider } from './context/LoginModalContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <LoginModalProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </LoginModalProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);