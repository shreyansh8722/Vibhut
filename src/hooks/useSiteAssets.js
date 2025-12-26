import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useSiteAssets = () => {
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for assets
    const unsub = onSnapshot(doc(db, 'settings', 'global_assets'), (doc) => {
      if (doc.exists()) {
        setAssets(doc.data());
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Helper to safely get an image or fallback
  const getAsset = (key, fallbackUrl) => {
    return assets[key] || fallbackUrl || 'https://images.unsplash.com/photo-1610189012906-47833d772097?auto=format&fit=crop&q=80'; // Default fallback
  };

  return { assets, getAsset, loading };
};