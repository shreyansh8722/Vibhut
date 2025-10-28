import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc, // Import doc
  getDoc, // Import getDoc
} from 'firebase/firestore';
import { ArrowLeft, Loader2, Heart, Star } from 'lucide-react'; // Added Heart and Star
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth'; // Needed for SpotCard interactions

// --- Reusable Components (Slightly adapted from HomePage) ---

const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full bg-gray-100"> {/* Added bg for placeholder */}
      {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

// Skeleton for the grid items
const GridSkeletonCard = () => (
    <div className="w-full h-64 bg-gray-200 rounded-2xl animate-pulse" />
);

// SpotCard adapted for Grid (can be combined with HomePage's if props are unified)
const GridSpotCard = memo(({ spot, navigate, user }) => {
    // Basic favorite state, ideally sync with HomePage/useAuth if needed
    const [isFav, setIsFav] = useState(false);
    // You might want to implement toggleFavorite logic here too if needed on this page

    const imageSrc = spot.featuredImageUrl || spot.imageUrls?.[0] || "https://placehold.co/400x300";

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.98 }}
            className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer group"
            onClick={() => navigate(`/spot/${encodeURIComponent(spot.id)}`)}
        >
            <div className="aspect-w-1 aspect-h-1"> {/* Maintain aspect ratio */}
                <LazyImage src={imageSrc} alt={spot.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />

             {/* Heart Button - Needs full toggle logic if interaction desired here */}
             <button
                 // onClick={handleFavourite} // Add if needed
                 className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                 aria-label={"Add to favorites"} // Simplified for now
             >
                 <Heart size={16} fill={isFav ? "currentColor" : "none"} />
             </button>


            {/* Rating */}
            {spot.averageRating && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                    <Star size={10} className="stroke-[1.5]" />
                    <span>{spot.averageRating}</span>
                </div>
            )}

            {/* Name */}
            <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight drop-shadow-sm">
                    {spot.name}
                </h3>
                 <p className="text-white/80 text-xs mt-0.5 line-clamp-1">{spot.category}</p>
            </div>
        </motion.div>
    );
});


// --- Main Page Component ---
export default function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user for SpotCard interactions

  const [categoryName, setCategoryName] = useState(categoryId); // Default to ID
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Pagination State ---
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [allSpotsLoaded, setAllSpotsLoaded] = useState(false);
  const SPOTS_PER_PAGE = 12; // Show more in a grid

  // Read selectedCity from sessionStorage
  const selectedCity = sessionStorage.getItem("selectedCity");

  // Fetch Category Name and Initial Spots
  useEffect(() => {
    if (!categoryId || !selectedCity) {
      setError("Category or City not specified.");
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      setSpots([]); // Clear previous spots
      setLastDoc(null);
      setAllSpotsLoaded(false);

      try {
        // 1. Fetch Category Name (Optional but good UX)
        try {
            const catRef = doc(db, "categories", categoryId);
            const catSnap = await getDoc(catRef);
            if(catSnap.exists()) {
                setCategoryName(catSnap.data().name || categoryId);
            }
        } catch (catErr) {
            console.warn("Could not fetch category name:", catErr);
            setCategoryName(categoryId.charAt(0).toUpperCase() + categoryId.slice(1)); // Capitalize ID as fallback
        }


        // 2. Fetch first page of Spots for this category and city
        const q = query(
          collection(db, "spots"),
          where("category", "==", categoryId),
          where("cityId", "==", selectedCity),
          orderBy("name"), // Or orderBy('averageRating', 'desc') etc.
          limit(SPOTS_PER_PAGE)
        );

        const spotsSnap = await getDocs(q);
        const spotsData = spotsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSpots(spotsData);

        // 3. Set Pagination cursor
        if (spotsSnap.docs.length < SPOTS_PER_PAGE) {
          setAllSpotsLoaded(true);
        } else {
          setLastDoc(spotsSnap.docs[spotsSnap.docs.length - 1]);
        }
      } catch (err) {
        console.error("Error fetching category spots:", err);
        setError("Could not load spots for this category.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [categoryId, selectedCity]); // Re-fetch if category or city changes

  // --- "Load More" Function ---
  const handleLoadMore = async () => {
    if (loadingMore || allSpotsLoaded || !lastDoc || !selectedCity || !categoryId) return;

    setLoadingMore(true);
    try {
      const q = query(
        collection(db, "spots"),
        where("category", "==", categoryId),
        where("cityId", "==", selectedCity),
        orderBy("name"),
        startAfter(lastDoc),
        limit(SPOTS_PER_PAGE)
      );

      const spotsSnap = await getDocs(q);
      const newSpotsData = spotsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setSpots(prevSpots => [...prevSpots, ...newSpotsData]);

      if (spotsSnap.docs.length < SPOTS_PER_PAGE) {
        setAllSpotsLoaded(true);
        setLastDoc(null);
      } else {
        setLastDoc(spotsSnap.docs[spotsSnap.docs.length - 1]);
      }
    } catch (err) {
      console.error("Error loading more spots:", err);
      setError("Could not load more spots."); // Show error to user
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm py-3 px-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)} // Go back
          className="rounded-full p-2 -ml-2 hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft />
        </button>
        <div>
          <h1 className="text-lg font-semibold capitalize">{categoryName}</h1>
          {selectedCity && <p className="text-xs text-gray-500">in {selectedCity}</p>}
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-4">
        {error && <div className="text-center text-red-500 my-10">{error}</div>}

        {loading ? (
           <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => <GridSkeletonCard key={i} />)}
           </div>
        ) : spots.length === 0 && !error ? (
           <div className="text-center text-gray-500 py-20">
              <p>No spots found for "{categoryName}" in {selectedCity}.</p>
           </div>
        ) : (
          <motion.div
              layout // Animate layout changes when loading more
              className="grid grid-cols-2 gap-4"
           >
            {spots.map(spot => (
              <GridSpotCard
                key={spot.id}
                spot={spot}
                navigate={navigate}
                user={user}
              />
            ))}
          </motion.div>
        )}

        {/* --- Load More Button --- */}
        <div className="mt-8 text-center">
          {loadingMore && <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-500" />}
          {!loading && !loadingMore && !allSpotsLoaded && spots.length > 0 && (
            <button
              onClick={handleLoadMore}
              className="bg-black text-white px-6 py-2.5 rounded-full font-medium transition-opacity hover:opacity-80"
            >
              Load More
            </button>
          )}
          {!loading && allSpotsLoaded && spots.length >= SPOTS_PER_PAGE && ( // Show only if pagination was used
            <p className="text-gray-500">You've reached the end</p>
          )}
        </div>
      </div>
    </div>
  );
}
