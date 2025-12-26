import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/context/CartContext';

export const ProductRecommendations = ({ title, category, currentProductId, type = 'related' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        let q;

        // Try filtering by category first
        if (type === 'related' && category) {
          q = query(productsRef, where('category', '==', category), limit(6));
        } else {
          q = query(productsRef, orderBy('createdAt', 'desc'), limit(6));
        }

        const snap = await getDocs(q);
        let docs = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => p.id !== currentProductId)
          .slice(0, 4);

        // Fallback: If no related items, fetch recent items
        if (docs.length === 0 && type === 'related') {
           const fallbackQ = query(productsRef, orderBy('createdAt', 'desc'), limit(6));
           const fallbackSnap = await getDocs(fallbackQ);
           docs = fallbackSnap.docs
             .map(d => ({ id: d.id, ...d.data() }))
             .filter(p => p.id !== currentProductId)
             .slice(0, 4);
        }
        
        setProducts(docs);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [category, currentProductId, type]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-12 border-t border-gray-100">
      <div className="mb-8 text-center">
        <h3 className="font-serif text-2xl md:text-3xl text-brand-dark mb-2">{title}</h3>
        <div className="w-12 h-0.5 bg-[#B08D55] mx-auto" />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-300" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
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
      )}
    </section>
  );
};