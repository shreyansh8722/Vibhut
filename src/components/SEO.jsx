import React, { useEffect } from 'react';

export const SEO = ({ title, description }) => {
  useEffect(() => {
    // Update the document title
    document.title = title ? `${title} | Vishwanatham` : "Vishwanatham | The Spiritual Ecosystem of Kashi";
    
    // Update the meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description || "Authentic Rudraksha, Gemstones, and Puja Services directly from Varanasi.");
  }, [title, description]);

  return null;
};

export default SEO;