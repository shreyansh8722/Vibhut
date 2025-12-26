import { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth'; 
import { useLoginModal } from '../context/LoginModalContext'; 
import toast from 'react-hot-toast';

export function useFavorites() {
  const { user } = useAuth();
  // Ensure your LoginModalContext exports 'openLoginModal' or similar
  const { openLoginModal } = useLoginModal(); 
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) { 
        setFavorites([]); 
        return; 
    }
    // Real-time listener for favorites
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites?.map(String) || []);
      }
    });
    return () => unsub();
  }, [user]);

  const toggleFavorite = async (product) => {
    // 1. Check if user is logged in
    if (!user) {
      if (openLoginModal) {
          openLoginModal(); // Open the popup
          toast("Please login to save favorites");
      } else {
          console.error("Login Modal function not found");
          toast.error("Please login to continue");
      }
      return;
    }

    const pid = String(product?.id || product);
    const ref = doc(db, 'users', user.uid);

    try {
      // Create user doc if it doesn't exist yet
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
          await setDoc(ref, { favorites: [] }, { merge: true });
      }

      if (favorites.includes(pid)) {
        await updateDoc(ref, { favorites: arrayRemove(pid) });
        toast.success("Removed from wishlist");
      } else {
        await updateDoc(ref, { favorites: arrayUnion(pid) });
        toast.success("Added to wishlist");
      }
    } catch (e) {
      console.error("Error toggling favorite:", e);
      toast.error("Could not update wishlist");
    }
  };

  return { 
    favorites, 
    isFavorite: (id) => favorites.includes(String(id)), 
    toggleFavorite 
  };
}