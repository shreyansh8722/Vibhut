import React from 'react';
import logo from '../../assets/logo.webp';

const BrandLogo = ({ className, lightMode = false }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="relative mt-2">
      <img 
        src={logo} 
        alt="Vishwanatham Logo" 
        className="w-45 h-45 md:w-70 md:h-70 object-contain" 
      />
    </div>
  </div>
);

export default BrandLogo;