import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  // 1. Determine the image URL to display
  const mainImage = product.featuredImageUrl || product.image || 'https://via.placeholder.com/400';
  
  const price = Number(product.price) || 0;
  const comparePrice = Number(product.comparePrice) || 0;
  const savings = comparePrice > price ? comparePrice - price : 0;
  const rating = product.rating || 4.9;

  return (
    <div className="group relative flex flex-col bg-white">
      
      {/* 1. IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] md:aspect-square w-full overflow-hidden bg-gray-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Minimal Badges */}
        <div className="absolute top-0 left-0 p-2 flex flex-col gap-1">
          {product.isBestSeller && (
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
              Bestseller
            </span>
          )}
          {savings > 0 && (
            <span className="bg-[var(--color-primary)] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
              -{Math.round((savings/comparePrice)*100)}%
            </span>
          )}
        </div>

        {/* Hover Action Button */}
        <button 
           onClick={(e) => { 
             e.preventDefault(); 
             // FIX: Explicitly pass 'image' property to Cart so it displays correctly
             addToCart({ ...product, image: mainImage }); 
           }}
           className="absolute bottom-4 left-4 right-4 bg-white text-black py-3 text-xs font-bold uppercase tracking-wider shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-black hover:text-white"
        >
           <ShoppingBag size={14} /> Add to Cart
        </button>
      </div>

      {/* 2. PRODUCT INFO */}
      <div className="pt-4 pb-2">
        <h3 className="font-heading text-[17px] font-medium text-black leading-snug mb-1 line-clamp-2 hover:text-[var(--color-primary)] transition-colors">
          <Link to={`/product/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        {/* Rating & Price Row */}
        <div className="flex items-center justify-between mt-1">
           <div className="flex flex-col">
             <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-gray-900 font-body">₹{price.toLocaleString()}</span>
                {comparePrice > price && (
                   <span className="text-xs text-gray-400 line-through">₹{comparePrice.toLocaleString()}</span>
                )}
             </div>
           </div>

           {/* Star Rating (Subtle) */}
           <div className="flex items-center gap-1 opacity-80">
             <Star size={12} className="fill-black text-black" strokeWidth={0} />
             <span className="text-[11px] font-medium text-gray-600">{rating}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;