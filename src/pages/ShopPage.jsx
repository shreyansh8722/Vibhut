/* shreyansh8722/vishwanatham/Vishwanatham-2348871e510016e627219d73c9bd6b32f3b7c3af/pages/ShopPage.jsx */
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/shop/ProductCard';
import FilterSidebar from '../components/shop/FilterSidebar'; // Ensure this exists
import { Filter, ChevronRight, SlidersHorizontal, Loader2 } from 'lucide-react';

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // --- FILTER LOGIC (Simplified for display) ---
  const categoryParam = searchParams.get('category');
  
  // Filter products based on URL params or show all
  const filteredProducts = categoryParam 
    ? products.filter(p => p.category?.toLowerCase() === categoryParam.toLowerCase())
    : products;

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
     if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
     if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
     return 0; // Default featured/newest
  });

  if (loading) {
     return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[var(--color-primary)]" size={40} /></div>;
  }

  return (
    <div className="bg-white min-h-screen font-body text-black pt-0 pb-20">
      
      {/* 1. HEADER & BREADCRUMBS */}
      <div className="bg-gray-50 border-b border-gray-100 py-8 md:py-12">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
               <Link to="/" className="hover:text-black">Home</Link> 
               <ChevronRight size={10} />
               <span className="text-black">Shop</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-black mb-2">
               {categoryParam ? `${categoryParam} Collection` : 'All Spiritual Artifacts'}
            </h1>
            <p className="text-gray-500 max-w-2xl">
               Handpicked, energized, and 100% authentic tools for your spiritual journey.
            </p>
         </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
         
         {/* LEFT SIDEBAR (Filters) */}
         <div className="hidden md:block w-64 flex-shrink-0">
            <FilterSidebar /> 
         </div>

         {/* RIGHT GRID */}
         <div className="flex-1">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
               <span className="text-sm font-bold text-gray-500">
                  Showing {sortedProducts.length} results
               </span>
               
               <div className="flex items-center gap-4">
                  <button 
                    className="md:hidden flex items-center gap-2 text-sm font-bold uppercase"
                    onClick={() => setIsMobileFilterOpen(true)}
                  >
                     <Filter size={16} /> Filters
                  </button>

                  <div className="flex items-center gap-2">
                     <span className="hidden md:inline text-xs font-bold uppercase text-gray-400">Sort by:</span>
                     <select 
                        className="text-sm font-bold border-none bg-transparent outline-none cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                     >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest Arrivals</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* Product Grid */}
            {sortedProducts.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-10">
                  {sortedProducts.map((product) => (
                     <ProductCard key={product.id} product={product} />
                  ))}
               </div>
            ) : (
               <div className="py-20 text-center bg-gray-50 rounded-lg">
                  <h3 className="font-heading text-xl text-gray-400 mb-2">No products found</h3>
                  <button onClick={() => window.location.href='/shop'} className="text-[var(--color-primary)] font-bold text-sm underline">
                     Clear Filters
                  </button>
               </div>
            )}

         </div>
      </div>

      {/* MOBILE FILTER MODAL (Simple overlay) */}
      {isMobileFilterOpen && (
         <div className="fixed inset-0 z-50 bg-white p-4 overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center mb-6">
               <h2 className="font-heading text-2xl font-bold">Filters</h2>
               <button onClick={() => setIsMobileFilterOpen(false)} className="text-2xl">&times;</button>
            </div>
            <FilterSidebar />
            <button 
               onClick={() => setIsMobileFilterOpen(false)}
               className="w-full mt-8 py-4 bg-black text-white font-bold text-sm uppercase rounded"
            >
               Show Results
            </button>
         </div>
      )}

    </div>
  );
};

export default ShopPage;