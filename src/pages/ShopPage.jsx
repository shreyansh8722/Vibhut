import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/shop/ProductCard';
import FilterSidebar from '../components/shop/FilterSidebar';
import { Filter, ChevronRight, Loader2 } from 'lucide-react';

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // --- FILTER LOGIC ---
  const categoryParam = searchParams.get('category');
  
  const filteredProducts = categoryParam 
    ? products.filter(p => p.category?.toLowerCase() === categoryParam.toLowerCase())
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
     if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
     if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
     return 0; 
  });

  if (loading) {
     return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#B08D55]" size={40} /></div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-gray-50 border-b border-gray-100">
         <div className="container mx-auto px-4 py-8 md:py-12">
            
            {/* STANDARD BREADCRUMBS */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-6">
               <Link to="/" className="hover:text-[#B08D55] transition-colors">Home</Link> 
               <ChevronRight size={10} />
               <span className="text-gray-900">Shop</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-3">
               {categoryParam ? `${categoryParam} Collection` : 'All Spiritual Artifacts'}
            </h1>
            <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
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
               <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Showing {sortedProducts.length} results
               </span>
               
               <div className="flex items-center gap-4">
                  <button 
                    className="md:hidden flex items-center gap-2 text-xs font-bold uppercase"
                    onClick={() => setIsMobileFilterOpen(true)}
                  >
                     <Filter size={14} /> Filters
                  </button>

                  <div className="flex items-center gap-2">
                     <span className="hidden md:inline text-[10px] font-bold uppercase text-gray-400">Sort by:</span>
                     <select 
                        className="text-xs font-bold border-none bg-transparent outline-none cursor-pointer hover:text-[#B08D55] transition-colors"
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
               <div className="py-20 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <h3 className="font-serif text-xl text-gray-400 mb-2">No products found</h3>
                  <button onClick={() => window.location.href='/shop'} className="text-[#B08D55] font-bold text-xs uppercase tracking-widest hover:underline">
                     Clear Filters
                  </button>
               </div>
            )}

         </div>
      </div>

      {/* MOBILE FILTER MODAL */}
      {isMobileFilterOpen && (
         <div className="fixed inset-0 z-50 bg-white p-6 overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8">
               <h2 className="font-serif text-2xl font-bold">Filters</h2>
               <button onClick={() => setIsMobileFilterOpen(false)} className="text-2xl hover:text-red-500">&times;</button>
            </div>
            <FilterSidebar />
            <button 
               onClick={() => setIsMobileFilterOpen(false)}
               className="w-full mt-8 py-4 bg-black text-white font-bold text-sm uppercase tracking-widest rounded hover:bg-[#B08D55] transition-colors"
            >
               Show Results
            </button>
         </div>
      )}

    </div>
  );
};

export default ShopPage; 