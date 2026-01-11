import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ChevronRight, Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';

const SearchPopup = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { products } = useProducts();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Live Search Logic
  useEffect(() => {
    if (query.trim().length > 1 && products) {
      const lowerQuery = query.toLowerCase();
      const filtered = products.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(lowerQuery);
        const categoryMatch = p.category && p.category.toLowerCase().includes(lowerQuery);
        return nameMatch || categoryMatch;
      }).slice(0, 6); // Show top 6 results
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, products]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      onClose();
      setQuery('');
    }
  };

  const clearInput = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white animate-fade-in flex flex-col h-[100dvh]">
      {/* 1. Header with Close Button */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Search Store</span>
        <button 
          onClick={onClose} 
          className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* 2. Main Content */}
      <div className="flex-1 overflow-y-auto bg-sacred-pattern">
        <div className="container mx-auto px-5 py-6">
          
          {/* Big Search Input */}
          <form onSubmit={handleSearch} className="relative mb-8">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for 'Rudraksha'..."
              className="w-full bg-white border-2 border-gray-200 focus:border-[#2E4F3E] rounded-xl py-4 pl-5 pr-12 text-lg font-serif font-bold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-300 placeholder:font-sans"
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                    <button type="button" onClick={clearInput} className="p-1 text-gray-300 hover:text-gray-500">
                        <X size={18} />
                    </button>
                )}
                <button type="submit" className="bg-[#2E4F3E] text-white p-2 rounded-lg shadow-md">
                    <ArrowRight size={20} />
                </button>
            </div>
          </form>

          {/* Results List */}
          {results.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top Matches</h4>
              {results.map((product) => {
                 // Robust Image Fallback
                 const img = product.featuredImageUrl || product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/100?text=Vibhut';

                 return (
                  <div 
                    key={product.id}
                    onClick={() => { navigate(`/product/${product.id}`); onClose(); }}
                    className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-[#C5A059] transition-all"
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{product.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{product.category}</p>
                    </div>

                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                 );
              })}
              <button 
                onClick={handleSearch} 
                className="w-full py-3 mt-4 text-xs font-bold text-[#2E4F3E] uppercase tracking-widest bg-white border border-[#2E4F3E]/20 rounded-lg"
              >
                View All Results
              </button>
            </div>
          ) : (
            /* Empty State / Trending */
            !query && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4 text-[#C5A059]">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Trending Now</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['1 Mukhi Rudraksha', 'Ruby', 'Pearl', 'Money Magnet', 'Evil Eye'].map((term) => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); navigate(`/shop?search=${encodeURIComponent(term)}`); onClose(); }}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full hover:border-[#2E4F3E] hover:text-[#2E4F3E] transition-colors shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;