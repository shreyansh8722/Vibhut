import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  X,
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------------- Skeletons (for initial load) ---------------------- */

// Skeleton for the horizontal trending cards
const TrendingSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="w-64 h-64 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0" />
    ))}
  </div>
);

// Skeleton for the search results list
// ✅ --- TYPO FIX --- Removed the stray "_"
const ResultSkeleton = () => (
  <div className="flex flex-col gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex gap-3 animate-pulse">
        <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

/* ---------------------- Helper Components (New UI) ---------------------- */

// New card for the horizontal "Trending" carousel
const TrendingCard = memo(({ spot, navigate }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    onClick={() => navigate(`/spot/${spot.id}`)}
    className="w-64 h-64 flex-shrink-0 relative cursor-pointer rounded-2xl overflow-hidden shadow-lg"
  >
    <img
      src={spot.featuredImageUrl || spot.imageUrls?.[0] || "https://placehold.co/400x400"}
      alt={spot.name}
      loading="lazy"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
    <div className="absolute bottom-4 left-4 right-4">
      <h3 className="text-white font-semibold text-lg drop-shadow-md">
        {spot.name}
      </h3>
      <p className="text-white/90 text-sm drop-shadow-md">
        {spot.city || spot.category}
      </p>
    </div>
  </motion.div>
));

// New list item for "Search Results"
const ResultRow = memo(({ spot, navigate }) => (
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
      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
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

/* ---------------------- Main Search Page ---------------------- */

export default function SearchPage() {
  const [queryText, setQueryText] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true); // Now true by default for initial cache
  const navigate = useNavigate();

  // ✅ PERFORMANCE: Cache *all* spots in a ref *once* on page load.
  // All subsequent searches will be instant in-memory filters.
  const allSpotsCache = useRef([]);

  // Memoized filter function for speed
  const filterSpots = (allSpots, search) => {
    return allSpots.filter((spot) => {
      const name = spot.name?.toLowerCase() || "";
      const city = spot.city?.toLowerCase() || "";
      const tags = spot.tags_lowercase || [];
      return (
        name.includes(search) ||
        city.includes(search) ||
        tags.some((t) => t.includes(search))
      );
    });
  };

  // ✅ PERFORMANCE: Fetch trending AND all spots for cache in parallel on mount.
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch Trending
        const trendingQuery = query(
          collection(db, "spots"),
          orderBy("averageRating", "desc"),
          limit(5)
        );
        // Fetch All Spots for Cache
        const allSpotsQuery = query(collection(db, "spots"));

        const [trendingSnap, allSpotsSnap] = await Promise.all([
          getDocs(trendingQuery),
          getDocs(allSpotsQuery),
        ]);

        // Set Trending
        setTrending(trendingSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        
        // Set Cache
        allSpotsCache.current = allSpotsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      } catch (err) {
        console.error("Initial data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Load recents from local storage (this is fast)
    const stored = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecent(stored);
  }, []);

  // ✅ PERFORMANCE: This is now an *instant* in-memory filter.
  // No debounce, no async, no loading. It's "buttery smooth."
  useEffect(() => {
    if (!queryText.trim()) {
      setSuggestions([]);
      return;
    }

    // Don't search if the cache is still loading
    if (loading || !allSpotsCache.current.length) return;

    const search = queryText.toLowerCase();
    const filtered = filterSpots(allSpotsCache.current, search);
    setSuggestions(filtered.slice(0, 5)); // limit suggestions
  }, [queryText, loading]);

  // ✅ PERFORMANCE: This is also an *instant* in-memory filter.
  const handleSearch = (e) => {
    e?.preventDefault(); // Allow calling without event
    const search = queryText.trim().toLowerCase();
    if (!search) return;

    // Don't search if cache isn't ready
    if (loading || !allSpotsCache.current.length) return;

    setSearched(true);
    setSuggestions([]); // Close suggestions
    
    const filtered = filterSpots(allSpotsCache.current, search);
    setResults(filtered);

    // Update recent searches
    const updated = [queryText, ...recent.filter((r) => r !== queryText)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleRecentClick = (term) => {
    setQueryText(term);
    // Use a tiny timeout to allow state to update before firing search
    setTimeout(() => handleSearch({ preventDefault: () => {} }), 50);
  };

  const clearSearch = () => {
    setQueryText("");
    setResults([]);
    setSuggestions([]);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ----------------- Sticky Header ----------------- */}
      <div className="sticky top-0 bg-white z-30 flex items-center gap-2 p-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Search Input Form */}
        <form
          onSubmit={handleSearch}
          className="relative flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-black"
        >
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search spots, cities, or tags..."
            className="bg-transparent outline-none text-sm w-full ml-2.5"
            inputMode="search"
            autoFocus
            autoComplete="off"
            aria-label="Search"
          />
          <AnimatePresence>
            {queryText.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                type="button"
                onClick={clearSearch}
                className="p-1 bg-gray-300 rounded-full text-gray-600 hover:bg-gray-400"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* ----------------- Live Suggestions Dropdown ----------------- */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 left-0 w-full bg-white z-20"
          >
            <div className="p-4 pt-2 border-b border-gray-100 shadow-md">
              {suggestions.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => navigate(`/spot/${spot.id}`)}
                  className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                >
                  <img
                    src={spot.featuredImageUrl || spot.imageUrls?.[0] || "https://placehold.co/64x64"}
                    alt={spot.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{spot.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">
                      {spot.category || "Unknown category"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- Main Content Area ----------------- */}
      <div className="p-5 overflow-y-auto flex-1">
        {/* ----- BEFORE SEARCH (or after clearing) ----- */}
        {!searched && (
          <div className="space-y-8">
            {/* Recent Searches */}
            {recent.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Searches</h2>
                  <button
                    onClick={() => {
                      setRecent([]);
                      localStorage.removeItem("recentSearches");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-900"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {recent.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleRecentClick(term)}
                      className="bg-gray-100 text-gray-700 text-sm px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Spots (New Horizontal UI) */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Trending Spots
              </h2>
              {loading ? (
                <TrendingSkeleton />
              ) : (
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1 -mx-1">
                  {trending.map((spot) => (
                    <TrendingCard key={spot.id} spot={spot} navigate={navigate} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ----- AFTER SEARCH ----- */}
        {searched && (
          <section>
            {/* Loading state for search is instant, so we don't need a spinner,
                we just check results.length */}
            {results.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Results ({results.length})
                </h2>
                <div className="flex flex-col gap-4">
                  {results.map((spot) => (
                    <ResultRow key={spot.id} spot={spot} navigate={navigate} />
                  ))}
                </div>
              </>
            ) : (
              // Empty State
              <div className="text-center text-gray-500 pt-20">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold">No results found</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Try a different keyword, like “food” or “heritage”.
                </p>
              </div>
            )}
          </section>
        )}

        {/* This is a safety check for the initial cache load */}
        {loading && !searched && (
          <div className="pt-8">
            <ResultSkeleton />
          </div>
        )}
      </div>
    </div>
  );
}

