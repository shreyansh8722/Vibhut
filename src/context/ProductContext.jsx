import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define the location of your "Database File"
  const DB_FILE_PATH = 'database/products.json';

  const fetchProducts = async () => {
    try {
      const fileRef = ref(storage, DB_FILE_PATH);
      
      // 1. Get the Download Link
      const url = await getDownloadURL(fileRef);
      
      // 2. Fetch the JSON content (Counts as 1 tiny request)
      const response = await fetch(url);
      if (!response.ok) throw new Error("File fetch failed");
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      // This handles the "First Run" case where the file doesn't exist yet
      console.warn("No product database found. Starting with empty list.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);