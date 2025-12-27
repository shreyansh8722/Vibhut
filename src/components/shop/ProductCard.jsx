import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  // Resolve images
  const imageList = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : [product.featuredImageUrl || product.image || 'https://via.placeholder.com/400'];

  // Switch to 2nd image on hover
  const displayImage = (isHovered && imageList.length > 1) ? imageList[1] : imageList[0];
  
  const price = Number(product.price) || 0;
  const comparePrice = Number(product.comparePrice) || 0;
  const savings = comparePrice > price ? comparePrice - price : 0;
  const hasReviews = product.reviews && Number(product.reviews) > 0;
  const rating = product.rating || 0;

  return (
    // CARD: Clean transition, subtle border hover
    <div className="group relative flex flex-col bg-white p-2 transition-all duration-300 hover:shadow-lg rounded-sm border border-transparent hover:border-black/10">
      
      {/* 1. IMAGE CONTAINER */}
      <div 
        className="relative aspect-square w-full overflow-hidden bg-[#FAFAFA] rounded-sm mb-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover object-center mix-blend-multiply"
            loading="lazy"
          />
        </Link>

        {/* Badges - Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">
              Bestseller
            </span>
          )}
          {savings > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest shadow-sm">
              -{Math.round((savings/comparePrice)*100)}%
            </span>
          )}
        </div>

        {/* ADD TO CART - Minimal Black Circle Icon */}
        <button 
           onClick={(e) => { 
             e.preventDefault(); 
             addToCart({ ...product, image: imageList[0] }); 
           }}
           className="absolute bottom-3 right-3 bg-black text-white p-2.5 rounded-full shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-gray-900 z-20 flex items-center justify-center"
           aria-label="Add to Cart"
        >
           <ShoppingBag size={16} strokeWidth={2} />
        </button>
      </div>

      {/* 2. PRODUCT INFO */}
      <div className="px-1 text-center">
        
        {/* Title */}
        <h3 className="font-heading text-[15px] font-bold text-black leading-tight mb-1.5 line-clamp-2">
          <Link to={`/product/${product.id}`} className="hover:text-gray-600 transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Price & Rating Row */}
        <div className="flex flex-col items-center gap-1">
           <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-black font-body">₹{price.toLocaleString()}</span>
              {comparePrice > price && (
                  <span className="text-xs text-gray-400 line-through font-medium">₹{comparePrice.toLocaleString()}</span>
              )}
           </div>

           {/* Rating - Subtle Appearance */}
           {hasReviews && (
               <div className="flex items-center gap-1 opacity-60">
                    <Star size={10} className="fill-black text-black" strokeWidth={0} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{rating} ({product.reviews})</span>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;