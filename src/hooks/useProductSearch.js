import { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';

export const useProductSearch = () => {
  const { products, loading } = useProducts();
  const [isReady, setIsReady] = useState(false);

  // Simple indexing (You can upgrade to Fuse.js later for fuzzy search)
  // We memorize this so we don't re-calc on every render
  const searchableProducts = useMemo(() => {
    if (loading || !products) return [];
    setIsReady(true);
    return products;
  }, [products, loading]);

  const search = (query) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();

    return searchableProducts.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) || 
      product.category?.toLowerCase().includes(lowerQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  return { search, loading, isReady };
};