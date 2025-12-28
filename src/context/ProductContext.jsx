import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      // 1. Check Local Storage (Browser Cache)
      const cachedData = localStorage.getItem('products_data');
      const cachedTime = localStorage.getItem('products_timestamp');
      const now = new Date().getTime();
      const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour Cache

      // If we have data and it's less than 1 hour old, USE IT INSTANTLY
      if (cachedData && cachedTime && (now - cachedTime < CACHE_DURATION)) {
        setProducts(JSON.parse(cachedData));
        setLoading(false);
        return; // Stop here, don't use network
      }

      // 2. If no cache, fetch from Firebase Storage
      try {
        const url = await getDownloadURL(ref(storage, 'database/products.json'));
        const response = await fetch(url);
        const data = await response.json();

        setProducts(data);
        
        // 3. Save to Local Storage for next time
        localStorage.setItem('products_data', JSON.stringify(data));
        localStorage.setItem('products_timestamp', now.toString());
        
      } catch (error) {
        console.error("Error loading products:", error);
        // Fallback: If fetch fails, try to use old cache even if expired
        if (cachedData) {
            setProducts(JSON.parse(cachedData));
        } else {
            setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper to force refresh (Call this if you just Published new changes)
  const refreshProducts = () => {
    localStorage.removeItem('products_data');
    window.location.reload();
  };

  return (
    <ProductContext.Provider value={{ products, loading, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);