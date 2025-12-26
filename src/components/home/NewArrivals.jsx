import React from 'react';
import { useProducts } from '../../context/ProductContext'; 
import ProductCard from '../shop/ProductCard'; 
import { Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewArrivals = () => {
  const { products, loading } = useProducts();
  const latestProducts = products.slice(0, 4); 

  if (loading) {
    return (
      <div className="py-24 flex justify-center bg-white">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  return (
    <section className="py-20 px-4 bg-white border-b border-gray-50"> 
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-black">
              New Arrivals
            </h2>
          </div>
          
          <Link to="/shop?sort=new" className="hidden md:flex items-center gap-2 text-sm font-bold text-black hover:text-[var(--color-primary)] transition-colors uppercase tracking-wider">
             View All Products <ArrowRight size={16} />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
          {latestProducts.length > 0 ? (
            latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">
                Our artisans are crafting new blessings...
              </p>
            </div>
          )}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-10 md:hidden text-center">
          <Link to="/shop?sort=new">
            <button className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded shadow-lg hover:bg-[var(--color-primary)] transition-colors">
              View All New
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;