import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useStorefront = () => {
  const [data, setData] = useState({
    spotlight: null,
    muse: null,
    fabrics: null,
    loading: true
  });

  useEffect(() => {
    // Listen to the exact same document we are saving to in Admin
    const unsub = onSnapshot(doc(db, 'storefront', 'home_content'), (doc) => {
      if (doc.exists()) {
        setData({
          spotlight: doc.data().spotlight || null,
          muse: doc.data().muse || null,
          fabrics: doc.data().fabrics || null,
          loading: false
        });
      } else {
        // Document doesn't exist yet (first run), return nulls so defaults take over
        setData(prev => ({ ...prev, loading: false }));
      }
    });
    return () => unsub();
  }, []);

  return data;
};