import React, { useState, useEffect, useMemo, memo } from "react";
import { db } from "../lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, MapPin, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/* ---------------------- Skeleton (Fixed) ---------------------- */
// This skeleton component will show while favorites are loading
// It prevents layout shift and makes the page feel faster.
const FavoriteSkeleton = () => (
  <div className="max-w-2xl mx-auto px-4 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
    <div className="flex flex-col gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 p-3 bg-white rounded-xl shadow-sm">
          <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

/* ---------------------- Favorite Card (New List UI) ---------------------- */
// A new component for the list view, similar to our Search Results
const FavoriteCard = memo(({ spot, onToggleFavorite, navigate }) => (
  <motion.div
    layout // Animates removal when un-favorited
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="flex items-center gap-4 p-3 bg-white rounded-2xl shadow-sm"
  >
    <img
      src={spot.featuredImageUrl || spot.imageUrls?.[0] || "https://placehold.co/100x100"}
      alt={spot.name}
      loading="lazy"
      className="w-24 h-24 rounded-xl object-cover flex-shrink-0 cursor-pointer"
      onClick={() => navigate(`/spot/${encodeURIComponent(spot.id)}`)}
    />
    <div
      className="flex-1 cursor-pointer"
      onClick={() => navigate(`/spot/${encodeURIComponent(spot.id)}`)}
    >
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
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(spot.id);
      }}
      className="p-2 rounded-full text-red-500 bg-red-100/50 hover:bg-red-100 transition-colors"
      aria-label="Remove from favorites"
    >
      <Heart size={18} fill="currentColor" />
    </button>
  </motion.div>
));

/* ---------------------- Main Page ---------------------- */
export default function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favoriteSpots, setFavoriteSpots] = useState([]);
  const [citiesMap, setCitiesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch favorites in real time (This logic is great, no changes)
  useEffect(() => {
    if (!user) {
      setFavoriteSpots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) {
        setFavoriteSpots([]);
        setLoading(false);
        return;
      }
      const favIds = snap.data().favorites || [];
      if (!favIds.length) {
        setFavoriteSpots([]);
        setLoading(false);
        return;
      }

      const chunks = [];
      const chunkSize = 10;
      for (let i = 0; i < favIds.length; i += chunkSize) {
        chunks.push(favIds.slice(i, i + chunkSize));
      }

      const spotsData = [];
      for (const c of chunks) {
        const q = query(collection(db, "spots"), where("__name__", "in", c));
        const snap2 = await getDocs(q);
        snap2.docs.forEach((d) =>
          spotsData.push({ id: d.id, ...d.data() })
        );
      }
      setFavoriteSpots(spotsData);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Fetch city names (for grouping)
  useEffect(() => {
    const fetchCities = async () => {
      const snap = await getDocs(collection(db, "cities"));
      const map = {};
      snap.docs.forEach((d) => {
        map[d.id] = d.data().name || d.id;
      });
      setCitiesMap(map);
    };
    fetchCities();
  }, []);

  // Toggle favorites (No changes, this is perfect)
  const toggleFavorite = async (spotId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const favs = userSnap.data().favorites || [];
    const isFav = favs.includes(spotId);

    await updateDoc(userRef, {
      favorites: isFav ? arrayRemove(spotId) : arrayUnion(spotId),
    });
  };

  // Group favorites by cityId
  const groupedByCity = useMemo(() => {
    return favoriteSpots.reduce((acc, spot) => {
      const city = spot.cityId || "unknown";
      if (!acc[city]) acc[city] = [];
      acc[city].push(spot);
      return acc;
    }, {});
  }, [favoriteSpots]);

  // ✅ Empty state is great
  if (!loading && !favoriteSpots.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600 bg-white">
        {/* Header */}
        <div className="absolute top-0 left-0 w-full p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        
        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold">No favorites yet</h2>
        <p className="mt-2 text-sm text-gray-500">
          Tap the heart icon on a spot to save it here.
        </p>
        <Link
          to="/"
          className="mt-5 px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800"
        >
          Explore Spots
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-5">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6 relative">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 absolute left-0"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-center w-full">
            My Favorites
          </h1>
        </div>

        {/* ✅ Show Skeleton while loading */}
        {loading ? (
          <FavoriteSkeleton />
        ) : (
          /* City sections with new list UI */
          <div className="space-y-8">
            {Object.entries(groupedByCity).map(([cityId, spots]) => (
              <section key={cityId} className="mb-8">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 tracking-tight">
                  {citiesMap[cityId] || "Other"}
                </h2>

                <div className="flex flex-col gap-4">
                  {spots.map((spot) => (
                    <FavoriteCard
                      key={spot.id}
                      spot={spot}
                      onToggleFavorite={toggleFavorite}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

