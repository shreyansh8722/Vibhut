import React from 'react';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../shop/ProductCard';
import { Loader2 } from 'lucide-react';

const BestSellers = () => {
  const { products, loading } = useProducts(); 

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  // Logic: Get items marked as Best Seller, or fallback to first 4 items
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const displayProducts = bestSellers.length > 0 ? bestSellers : products.slice(0, 4);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default BestSellers;