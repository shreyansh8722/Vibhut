// src/pages/HomePage.jsx
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Star,
  Home,
  Heart,
  Compass, 
  User,   
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";

const LoginPromptModal = lazy(() => import("../components/LoginPromptModal"));

/* ---------------------- Filters ---------------------- */
const FILTER_OPTIONS = [
  { id: "All", label: "All" },
  { id: "Popular", label: "Popular" },
  { id: "Budget", label: "Budget Friendly" },
  { id: "Recommended", label: "Recommended" },
];

function applyGlobalFilter(arr, filter) {
  if (!filter || filter === "All") return arr;
  if (filter === "Popular") return arr.filter((s) => (s.averageRating ?? 0) >= 4.5);
  if (filter === "Budget")
    return arr.filter((s) => {
      const price = s.priceRange?.match(/\d+/g);
      return price && Number(price[0]) <= 350;
    });
  if (filter === "Recommended") return arr.filter((s) => (s.reviewCount ?? 0) > 10);
  return arr;
}

/* ---------------------- Lazy Image ---------------------- */
const LazyImage = ({ src, alt, className, isPriority = false }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl" />}
      <img
        src={src}
        alt={alt}
        loading={isPriority ? "eager" : "lazy"}
        fetchpriority={isPriority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

/* ---------------------- Skeleton ---------------------- */
const SkeletonCard = () => (
  <div className="w-[140px] h-[200px] bg-gray-200 rounded-2xl animate-pulse flex-shrink-0 mx-1" />
);

/* ---------------------- Spot Card ---------------------- */
const SpotCard = memo(
  ({ spot, idx, activeIdx, navigate, user, showLoginPrompt, showToast, isPriority = false }) => {
    const [isFav, setIsFav] = useState(false);
    const imageSrc =
      spot.featuredImageUrl || spot.imageUrls?.[0] || "https://placehold.co/600x400";
    const isActive = idx === activeIdx;

    useEffect(() => {
      let mounted = true;
      if (user && spot) {
        getDoc(doc(db, "users", user.uid))
          .then((snap) => {
            if (!mounted) return;
            const favs = snap.data()?.favorites || [];
            setIsFav(favs.includes(spot.id));
          })
          .catch(() => {});
      } else {
        setIsFav(false);
      }
      return () => (mounted = false);
    }, [user, spot]);

    const handleFavourite = async (e) => {
      e.stopPropagation();
      if (!user) return showLoginPrompt();

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const favs = userSnap.data()?.favorites || [];
        const alreadyFav = favs.includes(spot.id);
        setIsFav(!alreadyFav);

        await updateDoc(userRef, {
          favorites: alreadyFav ? arrayRemove(spot.id) : arrayUnion(spot.id),
        });
        showToast(alreadyFav ? "Removed from favorites 💔" : "Added to favorites ❤️");
      } catch (err) {
        console.error("Favorite update failed:", err);
      }
    };

    return (
      <motion.div
        data-idx={idx}
        layout
        whileTap={{ scale: 0.97 }}
        animate={{ scale: isActive ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="relative flex-shrink-0 rounded-2xl overflow-hidden shadow-sm w-[140px] h-[200px] cursor-pointer mx-1 snap-start"
        onClick={() => navigate(`/spot/${encodeURIComponent(spot.id)}`)}
      >
        <LazyImage
          src={imageSrc}
          alt={spot.name}
          className="w-full h-full object-cover rounded-2xl"
          isPriority={isPriority} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-2xl" />

        <button
          onClick={handleFavourite}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm"
          aria-label={isFav ? "Remove favorite" : "Add to favorites"}
        >
          <Heart
            size={15}
            className={`transition-all ${isFav ? "fill-white text-white" : "stroke-white"}`}
          />
        </button>

        {spot.averageRating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/40 text-white text-[10px] px-2 py-[2px] rounded-full backdrop-blur-sm">
            <Star size={10} className="stroke-[1.5]" />
            <span>{spot.averageRating}</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-[13px] font-semibold line-clamp-2 leading-tight drop-shadow-sm">
            {spot.name}
          </h3>
        </div>
      </motion.div>
    );
  }
);

/* ---------------------- Swipe Hint ---------------------- */
const SwipeHint = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const shown = sessionStorage.getItem("swipeHintShown");

    if (isMobile && !shown) {
      setShow(true);
      sessionStorage.setItem("swipeHintShown", "true");
      setTimeout(() => setShow(false), 3000);
    }
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: [0, 1, 0], x: [15, 0, -10] }}
      transition={{ duration: 2.2, ease: "easeInOut" }}
      className="absolute top-[45%] right-3 flex items-center gap-1 text-gray-500/70 text-xs font-medium select-none pointer-events-none"
    >
      <span>Swipe</span>
      <ChevronRight size={13} />
    </motion.div>
  );
};

/* ---------------------- Intersection Hook ---------------------- */
const useOnScreen = (ref, rootMargin = "100px") => {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    let currentRef = ref.current; 
    if (!currentRef) return; 

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
           if (currentRef) observer.unobserve(currentRef);
        }
      },
      { rootMargin }
    );
    observer.observe(currentRef);

    return () => {
       if (currentRef) {
          observer.unobserve(currentRef);
       }
    };
  }, [ref, rootMargin]);
  return isIntersecting;
};

/* ---------------------- Category Row Component ---------------------- */
const CategoryRow = memo(
  ({ category, selectedCity, globalFilter, isPriorityRow = false, ...props }) => {
    const [spots, setSpots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const rowRef = useRef(null);
    const isVisible = useOnScreen(rowRef);
    const [hasFetched, setHasFetched] = useState(false);

    const [activeIdx, setActiveIdx] = useState(0);
    const containerRef = useRef(null);
    const computeActive = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      const items = Array.from(el.querySelectorAll("[data-idx]"));
      if (!items.length) return;
      const containerRect = el.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      let closest = 0;
      let minD = Infinity;
      items.forEach((it) => {
        const rect = it.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const d = Math.abs(cx - centerX);
        const idx = Number(it.getAttribute("data-idx"));
        if (d < minD) {
          minD = d;
          closest = idx;
        }
      });
      setActiveIdx(closest);
    }, []);

    useEffect(() => {
      // ✅ Keep this logic: it uses Intersection Observer to fetch data only when the row is visible
      if (!isVisible || !category.id || !selectedCity || hasFetched) {
          return;
      }

      let mounted = true;
      const fetchCategorySpots = async () => {
        setIsLoading(true);
        try {
          const q = query(
            collection(db, "spots"),
            where("category", "==", category.id),
            where("cityId", "==", selectedCity),
            limit(10)
          );
          const snap = await getDocs(q);
          if (!mounted) return;
          const spotData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setSpots(spotData);
          setHasFetched(true);
        } catch (err) {
          console.error(`Failed to fetch spots for: ${category.id} in ${selectedCity}`, err);
        } finally {
          if (mounted) setIsLoading(false);
        }
      };

      fetchCategorySpots();
      return () => (mounted = false);
    }, [isVisible, category.id, selectedCity, hasFetched]);

     useEffect(() => {
        setHasFetched(false);
        setSpots([]);
        setIsLoading(true);
     }, [selectedCity, category.id]);

    let title = category.name || category.id;
    if ( category.id.toLowerCase().includes("food") || (category.name && category.name.toLowerCase().includes("food")) )
      title = `Local eateries in ${selectedCity}`;
    else if ( category.id.toLowerCase().includes("heritage") || (category.name && category.name.toLowerCase().includes("heritage")) )
      title = `Top spots in ${selectedCity}`;
    else if ( category.id.toLowerCase().includes("artifact") || (category.name && category.name.toLowerCase().includes("artifact")) )
      title = `Local crafts in ${selectedCity}`;


    const filteredList = applyGlobalFilter(spots, globalFilter);

    // This is the Intersection Observer placeholder. It's working great.
    if (!isVisible && !hasFetched) {
        return <div ref={rowRef} className="h-[250px] w-full" />;
    }

    if (!isLoading && filteredList.length === 0) {
      return null;
    }

    return (
      <section ref={rowRef} className="mb-8 relative">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold capitalize">{title}</h2>
          <Link
            to={`/category/${category.id}`}
            className="text-xs font-medium text-black bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
            aria-label={`See all ${title}`}
          >
            See All
          </Link>
        </div>
        <div
          ref={containerRef}
          onScroll={computeActive}
          className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-[6px] scroll-smooth snap-x snap-mandatory"
        >
          {isLoading ? (
            [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
          ) : (
            filteredList.map((spot, i) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                idx={i}
                activeIdx={activeIdx}
                isPriority={isPriorityRow && i === 0} 
                {...props}
              />
            ))
          )}
        </div>
        {filteredList.length > 2 && <SwipeHint />}
      </section>
    );
  }
);


/* ---------------------- Main ---------------------- */
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(
    () => sessionStorage.getItem("selectedCity") || ""
  );
  const [loadingCities, setLoadingCities] = useState(true);
  const [hideNav, setHideNav] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); }, []);
  const showLoginPrompt = useCallback(() => setShowPrompt(true), []);
  const firstName = (user?.displayName?.split(" ")[0] || "Guest").replace(/[^A-Za-z]/g, "") || "Guest";

  // ✅ OPTIMIZATION 1: Memoize the fetch function using useCallback.
  const fetchInitialMeta = useCallback(async () => {
    setLoadingCities(true);
    try {
      // Fetch both collections in parallel
      const [citySnap, catSnap] = await Promise.all([
        getDocs(collection(db, "cities")),
        getDocs(collection(db, "categories")),
      ]);

      const cs = citySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const cats = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort categories 
      const findByKey = (arr, key) => arr.find( (c) => (c.id && c.id.toLowerCase().includes(key)) || (c.name && c.name.toLowerCase().includes(key)) );
      const preferred = [ findByKey(cats, "food"), findByKey(cats, "heritage"), findByKey(cats, "artifact"), ].filter(Boolean);
      const remaining = cats.filter((c) => !preferred.some((p) => p.id === c.id));
      const orderedCats = preferred.concat(remaining);

      setCities(cs);
      setCategories(orderedCats.length ? orderedCats : cats);

      // Set the initial city state based on loaded data
      setSelectedCity(currentSelectedCity => {
          const storedCity = sessionStorage.getItem("selectedCity");
          const isValidStoredCity = cs.some(city => city.name === storedCity);

          if (isValidStoredCity) {
              return storedCity; 
          } else if (cs.length > 0) {
              const defaultCity = cs[0].name;
              sessionStorage.setItem("selectedCity", defaultCity);
              return defaultCity;
          }
          return ""; 
      });

    } catch (err) {
      console.error("Failed to load cities/categories:", err);
    } finally {
      setLoadingCities(false);
    }
  }, []); // Empty dependencies: function is created once

  // ✅ OPTIMIZATION 2: Run data fetch immediately on mount.
  useEffect(() => {
    let mounted = true;
    
    // We call the memoized function. 
    // We don't need the 'mounted' check inside the main function since we only 
    // run it once on mount and Firebase handles unmounted component state updates gracefully
    fetchInitialMeta();

    return () => {
      // cleanup logic
      mounted = false;
    };
  }, [fetchInitialMeta]); // Dependency ensures the effect can call the memoized function

  // Save selectedCity to sessionStorage
  useEffect(() => {
      if (selectedCity && !loadingCities && cities.some(c => c.name === selectedCity)) {
          sessionStorage.setItem("selectedCity", selectedCity);
      }
  }, [selectedCity, loadingCities, cities]);

  // Hide nav on scroll (unchanged)
  useEffect(() => {
      let last = window.scrollY;
      const onScroll = () => { /* ... */ };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbfdff] to-white text-black pb-28">
      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Left Side: Greeting & City Selector */}
          <div>
            <h1 className="text-2xl font-semibold mb-1">Hello, {firstName} 👋</h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-700 text-sm">Let’s explore</p>
              <div className="relative flex items-center gap-1">
                <span className={`font-medium ${loadingCities && !selectedCity ? 'text-gray-400' : ''}`}>
                   {/* 💥 FIX: Change '...' to 'City' to avoid a loading symbol flash, making it feel faster */}
                   {selectedCity || 'Select City'}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  aria-label="Select city"
                  disabled={loadingCities}
                >
                  {!selectedCity && <option value="" disabled>Select City</option>}
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 mb-5 shadow-inner border border-gray-200">
          <Search size={18} className="text-gray-500" />
          <input
            readOnly
            onClick={() => navigate("/search")}
            placeholder="Search destinations, eateries, heritage..."
            className="bg-transparent w-full text-sm ml-3 placeholder-gray-500 focus:outline-none"
            aria-label="Search"
          />
          <button
            onClick={() => setFilterModal(true)}
            className="ml-2 p-2 rounded-full bg-black text-white"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>


        {/* Categories */}
        {loadingCities ? (
          <div className="space-y-8">
             {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                   <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                   <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-[6px]">
                      {[1,2,3].map(j => <SkeletonCard key={j}/>)}
                   </div>
                </div>
             ))}
           </div>
        ) : categories.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No categories found.</div>
        ) : (
          selectedCity ? categories.map((cat, index) => ( 
            <CategoryRow
              key={`${selectedCity}-${cat.id}`}
              category={cat}
              selectedCity={selectedCity}
              globalFilter={globalFilter}
              isPriorityRow={index === 0} 
              navigate={navigate}
              user={user}
              showToast={showToast}
              showLoginPrompt={showLoginPrompt}
            />
          )) : (
              <div className="text-center text-gray-500 py-10">Please select a city to see spots.</div>
          )
        )}
      </div>

      {/* Filter Modal (Structure unchanged) */}
      <AnimatePresence>
        {filterModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-end"
                style={{ willChange: "opacity" }}
                onClick={() => setFilterModal(false)}
            >
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-white rounded-t-[28px] shadow-2xl p-6 pb-8 border-t border-gray-100"
                >
                    <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                        <button onClick={() => setFilterModal(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close filters">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {FILTER_OPTIONS.map((f) => (
                            <motion.button
                                key={f.id}
                                whileTap={{ scale: 0.97, backgroundColor: "#00000010" }}
                                onClick={() => {
                                    setGlobalFilter(f.id);
                                    requestAnimationFrame(() => setFilterModal(false));
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                    globalFilter === f.id ? "bg-black text-white" : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {f.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Login Prompt (Structure unchanged) */}
      <Suspense fallback={null}>
         <LoginPromptModal open={showPrompt} onClose={() => setShowPrompt(false)} />
      </Suspense>

      {/* Toast (Structure unchanged) */}
      <AnimatePresence>
        {toast && (
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-4 py-2 rounded-full shadow-md backdrop-blur-md z-50"
            >
                {toast}
            </motion.div>
        )}
      </AnimatePresence>

      
    </div>
  );
}