import React, { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ TYPO FIX HERE
import { db } from '../lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { ArrowLeft, MapPin, Star, Loader2, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';

/* ---------------------- Skeletons ---------------------- */

const SpotRowSkeleton = () => (
  <div className="flex gap-4 p-2 animate-pulse">
    <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  </div>
);

const AmbassadorPageSkeleton = () => (
  <div className="min-h-screen bg-white animate-pulse">
    <div className="h-48 bg-gray-200 relative">
      <div className="absolute top-4 left-4 w-10 h-10 bg-gray-300 rounded-full" />
    </div>
    <div className="p-6 -mt-20">
      <div className="flex items-end gap-4">
        <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white" />
        <div className="flex-1 mb-4 space-y-2">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mt-4" />
      <div className="h-4 bg-gray-200 rounded w-5/6 mt-2" />
      <div className="h-6 bg-gray-200 rounded w-1/3 mt-10 mb-4" />
      <SpotRowSkeleton />
      <SpotRowSkeleton />
    </div>
  </div>
);

/* ---------------------- Spot Row Component ---------------------- */
// Using the same clean list UI from Search/Favorites
const SpotRow = memo(({ spot, navigate }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => navigate(`/spot/${spot.id}`)}
    className="flex items-center gap-4 p-2 -m-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
  >
    <img
      src={spot.featuredImageUrl || spot.imageUrls?.[0] || "https://placehold.co/100x100"}
      alt={spot.name}
      loading="lazy"
      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
    />
    <div className="flex-1">
      <h3 className="text-base font-semibold text-gray-900">{spot.name}</h3>
      <p className="text-sm text-gray-500 capitalize">
        {spot.category || "Spot"}
      </p>
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
        <MapPin className="w-3 h-3" />
        <span>{spot.city || "Jaipur"}</span>
        <span className="text-gray-300">|</span>
        <Star className="w-3 h-3 text-yellow-500" />
        <span>{spot.averageRating || "N/A"}</span>
      </div>
    </div>
  </motion.div>
));

/* ---------------------- Main Page ---------------------- */
export default function AmbassadorProfilePage() {
  const { ambassadorId } = useParams();
  const navigate = useNavigate();

  const [ambassador, setAmbassador] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Pagination State ---
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [allSpotsLoaded, setAllSpotsLoaded] = useState(false);
  const SPOTS_PER_PAGE = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ PERFORMANCE: Fetch ambassador and their first page of spots in parallel.
        const ambassadorRef = doc(db, "ambassadors", ambassadorId);
        const spotsQuery = query(
          collection(db, "spots"),
          where("ambassadorId", "==", ambassadorId),
          orderBy("name"), // You can order by name, rating, etc.
          limit(SPOTS_PER_PAGE)
        );

        const [ambassadorSnap, spotsSnap] = await Promise.all([
          getDoc(ambassadorRef),
          getDocs(spotsQuery),
        ]);

        // 1. Set Ambassador
        if (!ambassadorSnap.exists()) {
          throw new Error("Ambassador not found");
        }
        const ambassadorData = { id: ambassadorSnap.id, ...ambassadorSnap.data() };
        setAmbassador(ambassadorData);

        // 2. Set first page of Spots
        const spotsData = spotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSpots(spotsData);

        // 3. Set Pagination cursor
        if (spotsSnap.docs.length < SPOTS_PER_PAGE) {
          setAllSpotsLoaded(true);
        } else {
          setLastDoc(spotsSnap.docs[spotsSnap.docs.length - 1]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ambassadorId]);

  // --- "Load More" Function ---
  const handleLoadMore = async () => {
    if (loadingMore || allSpotsLoaded || !lastDoc) return;

    setLoadingMore(true);
    try {
      const spotsQuery = query(
        collection(db, "spots"),
        where("ambassadorId", "==", ambassadorId),
        orderBy("name"),
        startAfter(lastDoc),
        limit(SPOTS_PER_PAGE)
      );

      const spotsSnap = await getDocs(spotsQuery);
      const newSpotsData = spotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setSpots(prevSpots => [...prevSpots, ...newSpotsData]);

      if (spotsSnap.docs.length < SPOTS_PER_PAGE) {
        setAllSpotsLoaded(true);
        setLastDoc(null);
      } else {
        setLastDoc(spotsSnap.docs[spotsSnap.docs.length - 1]);
      }
    } catch (err) {
      console.error("Error loading more spots:", err);
      setError("Could not load more spots.");
    } finally {
      setLoadingMore(false);
    }
  };

  // ✅ PERFORMANCE: Use Skeleton for initial load to prevent CLS
  if (loading) {
    return <AmbassadorPageSkeleton />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!ambassador) {
    return null; // or a "not found" message
  }

  // --- Helper to make social @handle a link ---
  const socialUrl = ambassador.socials?.startsWith('http') 
    ? ambassador.socials 
    : `https://instagram.com/${ambassador.socials?.replace('@', '')}`;

  return (
    <div className="min-h-screen bg-white">
      {/* --- Header Section (New Dynamic UI) --- */}
      <div className="relative h-48">
        {/* Blurred background image */}
        <img
          src={ambassador.profileImageUrl || '/avatar-placeholder.png'}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110 opacity-60"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)} // Goes back
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md z-10"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* --- Profile Info Section --- */}
      <div className="p-6 -mt-20 relative z-10">
        <div className="flex items-end gap-4">
          <img
            src={ambassador.profileImageUrl || 'https://placehold.co/128x128'}
            alt={ambassador.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>
        
        <h1 className="text-3xl font-bold mt-4">{ambassador.name}</h1>
        <a
          href={socialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-lg flex items-center gap-1.5"
        >
          <LinkIcon size={16} />
          {ambassador.socials || 'Social'}
        </a>

        <p className="text-gray-700 my-4">{ambassador.bio}</p>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={16} />
          Based in {ambassador.cityId || 'India'}
        </div>
      </div>

      {/* --- Suggested Spots Section (New List UI) --- */}
      <div className="p-6 pt-0">
        <h2 className="text-2xl font-bold mb-4">
          Suggestions by {ambassador.name.split(' ')[0]}
        </h2>

        {spots.length > 0 ? (
          <div className="flex flex-col gap-5">
            {spots.map(spot => (
              <SpotRow
                key={spot.id}
                spot={spot}
                navigate={navigate}
              />
            ))}
            
            {/* --- Load More Button --- */}
            <div className="mt-4 text-center">
              {!allSpotsLoaded && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-black text-white px-6 py-2.5 rounded-full font-medium transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-wait"
                >
                  {loadingMore ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    'Load More'
                  )}
                </button>
              )}
              {allSpotsLoaded && spots.length > SPOTS_PER_PAGE && (
                <p className="text-gray-500">No more suggestions</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            {ambassador.name} hasn't suggested any spots yet.
          </p>
        )}
      </div>
    </div>
  );
}

