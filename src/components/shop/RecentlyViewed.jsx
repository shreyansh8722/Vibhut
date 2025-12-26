import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { documentId, where, query, collection, getDocs } from 'firebase/firestore';
import { ProductCard } from '@/components/shop/ProductCard';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/hooks/useFavorites';

export const RecentlyViewed = ({ currentProductId }) => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    // 1. Get IDs from LocalStorage
    const viewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    
    // 2. Filter out current product and limit to 4
    const idsToFetch = viewed.filter(id => id !== currentProductId).slice(0, 4);

    if (idsToFetch.length === 0) return;

    // 3. Fetch Data
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where(documentId(), 'in', idsToFetch));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetched);
      } catch (err) {
        console.error("Error fetching recent:", err);
      }
    };

    fetchProducts();
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-10 pb-10 border-t border-gray-100">
      <h3 className="font-serif text-2xl text-gray-900 mb-8">Recently Viewed</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {products.map(item => (
          <ProductCard 
            key={item.id} 
            item={item} 
            onAddToCart={() => addToCart(item)}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};