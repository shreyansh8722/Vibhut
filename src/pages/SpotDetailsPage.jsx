import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Check,
  Star,
  Clock,
  Tag,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";

const LoginPromptModal = lazy(() => import("../components/LoginPromptModal"));

// ... (Skeletons, Shimmer, ImageCarousel, AmbassadorInfo, ReviewsPreview remain unchanged) ...
/* ---------------------- Skeleton Loaders ---------------------- */
const Skeleton = memo(() => (
  <div className="animate-pulse">
    <div className="w-full h-[400px] bg-gray-200" />
    <div className="px-6 mt-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  </div>
));

const AmbassadorSkeleton = () => (
  <div className="mt-6 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 animate-pulse">
    <div className="w-8 h-8 bg-gray-200 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const ReviewSkeleton = () => (
  <ul className="mt-4 space-y-4">
    {[1, 2].map((i) => (
      <li key={i} className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-full mt-2" />
        <div className="h-3 bg-gray-200 rounded w-5/6 mt-1" />
      </li>
    ))}
  </ul>
);

/* ---------------------- Shimmer Style ---------------------- */
const ShimmerStyle = () => (
  <style>{`
    .shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%);
      transform: translateX(-100%);
      animation: shimmer 900ms linear forwards;
    }
    @keyframes shimmer {
      to { transform: translateX(100%); }
    }
  `}</style>
);


/* ---------------------- Image Carousel ---------------------- */
const ImageCarousel = memo(({ images = [], spotName = "Spot" }) => {
  const [index, setIndex] = useState(0);
  const startX = useRef(null);

  const handleTouchStart = (e) => (startX.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (startX.current === null) return;
    const delta = e.changedTouches[0].clientX - startX.current;
    if (delta < -50 && index < images.length - 1) setIndex((i) => i + 1);
    if (delta > 50 && index > 0) setIndex((i) => i - 1);
    startX.current = null;
  };

  const validImages = Array.isArray(images) ? images : [];
  const imageCount = validImages.length;

  if (imageCount === 0) {
    return (
      <div className="fixed top-0 left-0 w-full h-[400px] bg-gray-100 flex items-center justify-center z-0">
         <img src="https://placehold.co/600x400/eee/ccc?text=No+Image" alt="No image available" className="w-full h-full object-cover"/>
      </div>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 w-full h-[400px] overflow-hidden z-0 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false}>
          <motion.img
            key={index}
            src={validImages[index]}
            alt={`${spotName} image ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable="false"
          />
      </AnimatePresence>

      {imageCount > 1 && (
        <>
          {index > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/40 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center" // Consistent circular style
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="drop-shadow-sm" />
            </motion.button>
          )}
          {index < imageCount - 1 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIndex((i) => Math.min(imageCount - 1, i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/40 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center" // Consistent circular style
              aria-label="Next image"
            >
              <ChevronRight size={20} className="drop-shadow-sm" />
            </motion.button>
          )}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {index + 1} / {imageCount}
           </div>
        </>
      )}
    </div>
  );
});

/* ----------------- Ambassador Info (Self-Fetching) ----------------- */
const AmbassadorInfo = memo(({ ambassadorId }) => {
  const [ambassador, setAmbassador] = useState(null);

  useEffect(() => {
    if (!ambassadorId) return;
    let cancelled = false;
    getDoc(doc(db, "ambassadors", ambassadorId)).then((ambSnap) => {
      if (ambSnap.exists() && !cancelled) {
        setAmbassador({ id: ambSnap.id, ...ambSnap.data() });
      } else if (!cancelled) {
        console.warn(`Ambassador with ID ${ambassadorId} not found.`);
      }
    }).catch(err => console.error("Error fetching ambassador:", err));
    return () => (cancelled = true);
  }, [ambassadorId]);

  if (!ambassadorId) return null;
  if (!ambassador) return <AmbassadorSkeleton />;

  return (
    <Link
      to={`/ambassador/${ambassador.id}`}
      className="mt-6 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
    >
      <User className="w-6 h-6 text-gray-500"/>
      <div>
        <p className="text-xs text-gray-500">Suggested by</p>
        <p className="text-sm font-medium">{ambassador.name || 'Ambassador'}</p>
      </div>
    </Link>
  );
});


/* ------------------ Reviews Preview (Self-Fetching) ------------------ */
const ReviewsPreview = memo(({ spotId }) => {
  const [reviewsPreview, setReviewsPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spotId) return;
    let cancelled = false;
    setLoading(true);
    const q = query(
      collection(db, "reviews"),
      where("spotId", "==", spotId),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    getDocs(q).then((rsnap) => {
      if (!cancelled) {
        const reviews = rsnap.docs.map((d) => {
          const data = d.data();
          const username = data.username ? data.username.split(" ")[0].split("@")[0] : "User";
          return { id: d.id, ...data, username: username };
        });
        setReviewsPreview(reviews);
        setLoading(false);
      }
    }).catch(err => {
      console.error("Error fetching reviews preview:", err);
      if (!cancelled) setLoading(false);
    });
    return () => (cancelled = true);
  }, [spotId]);

  if (loading) return <div className="px-6 mt-8 text-sm text-gray-500">Loading reviews...</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <Link
          to={`/spot/${spotId}/reviews`}
          className="text-black font-medium text-sm hover:underline"
        >
          See all →
        </Link>
      </div>

      {reviewsPreview.length === 0 ? (
        <p className="text-gray-500 mt-2">No reviews yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviewsPreview.map((r) => (
            <li
              key={r.id}
              className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">{r.username}</p>
                <span className="flex items-center gap-1 text-gray-800">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {r.rating}
                </span>
              </div>
              <p className="text-gray-600 mt-1.5 text-sm leading-snug line-clamp-2">
                {r.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});


/* -------------------------- Main Component -------------------------- */
export default function SpotDetailsPage() {
  const { spotId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
      const current = window.scrollY;
      if (!ticking.current) {
          window.requestAnimationFrame(() => {
              if (current > 100 && current > lastScrollY.current) {
                  setShowButtons(false);
              } else if (current < lastScrollY.current - 10 || current <= 100) {
                  setShowButtons(true);
              }
              lastScrollY.current = current;
              ticking.current = false;
          });
          ticking.current = true;
      }
  }, []);

  useEffect(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!spotId) return;
    let cancelled = false;
    const fetchSpotData = async () => {
        setLoading(true);
        try {
            const snap = await getDoc(doc(db, "spots", spotId));
            if (!snap.exists()) {
                if (!cancelled) setSpot(null);
                console.error("Spot not found with ID:", spotId);
                return;
            }
            const data = { id: snap.id, ...snap.data() };
            if (!cancelled) setSpot(data);
        } catch (err) {
            console.error("Error fetching spot details:", err);
            if (!cancelled) setSpot(null);
        } finally {
            if (!cancelled) setLoading(false);
        }
    };
    fetchSpotData();
    return () => (cancelled = true);
  }, [spotId]);

  useEffect(() => {
    if (!user || !spotId) {
      setIsFav(false);
      return;
    }
    const checkFav = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().favorites?.includes(spotId)) {
          setIsFav(true);
        } else {
          setIsFav(false);
        }
      } catch (err) {
         console.error("Error checking favorite status:", err);
         setIsFav(false);
      }
    };
    checkFav();
  }, [user, spotId]);

  const toggleFavorite = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, {
        favorites: isFav ? arrayRemove(spotId) : arrayUnion(spotId),
      });
      setIsFav(!isFav);
    } catch (err) {
      console.error("Error updating favorite:", err);
    }
  };

  const handleShare = async () => {
     const shareData = {
        title: spot?.name || "CitySaathi Spot",
        text: (spot?.fullDescription || "").slice(0, 120) + "...",
        url: window.location.href,
     };
     try {
         if (navigator.share) {
             await navigator.share(shareData);
         } else {
             await navigator.clipboard.writeText(window.location.href);
             setCopied(true);
             setTimeout(() => setCopied(false), 1500);
         }
     } catch (err) {
         console.error("Share failed:", err);
     }
  };

  const mapsUrl = useMemo(() => {
      if (!spot) return "#";
      return (
        spot.googleMapsUrl ||
        (spot.location?.latitude
          ? `https://www.google.com/maps/search/?api=1&query=${spot.location.latitude},${spot.location.longitude}`
          : "https://maps.google.com")
      );
  }, [spot]);

  const images = useMemo(() => {
    if (!spot) return [];

    let allImages = [];
    if (spot.featuredImageUrl) {
      allImages.push(spot.featuredImageUrl);
    }
    if (Array.isArray(spot.imageUrls)) {
      spot.imageUrls.forEach(url => {
        if (url && url !== spot.featuredImageUrl) {
          allImages.push(url);
        }
      });
    }
    return allImages;
  }, [spot]);


  if (loading) return <Skeleton />;
  if (!spot) return <div className="p-10 text-center text-red-500">Spot data could not be loaded or found.</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="relative min-h-screen bg-white text-black overflow-hidden"
    >
      <ShimmerStyle />
      <ImageCarousel images={images} spotName={spot.name}/>

      {/* --- Circular Top Buttons (White Background) --- */}
      <motion.div
        animate={{ opacity: showButtons ? 1 : 0, y: showButtons ? 0 : -10 }}
        transition={{ duration: 0.2 }}
        className="fixed top-6 left-0 w-full px-5 flex justify-between items-center z-20"
      >
        {/* Back Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors" // White circle
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex gap-3">
          {/* Favorite Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleFavorite}
            className={`w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors ${ // White circle
              isFav ? "text-red-500" : "text-gray-700" // Correct text colors
            }`}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
             <AnimatePresence mode="wait">
               <motion.span
                 key={isFav ? 'filled' : 'empty'}
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.8, opacity: 0 }}
                 transition={{ duration: 0.15 }}
                 style={{ display: 'inline-block' }}
               >
                 <Heart
                    size={20}
                    fill={isFav ? "currentColor" : "none"}
                    // No className needed here, color inherited from parent text color
                  />
               </motion.span>
            </AnimatePresence>
          </motion.button>
          {/* Share Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors" // White circle
            aria-label="Share spot"
          >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
          </motion.button>
        </div>
      </motion.div>

      <div className="relative z-10 mt-[360px] bg-white rounded-t-[32px] shadow-lg pb-28">
        <div className="px-6 pt-8">
            <div className="flex justify-between items-start">
              <h1 className="text-[22px] font-semibold leading-snug text-gray-900 mr-4">
                {spot.name}
              </h1>
              <div className="flex flex-col items-end flex-shrink-0">
                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full text-sm">
                  <Star className="text-black w-4 h-4 mr-1" />
                  {spot.averageRating ?? "—"}
                </div>
                <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                  {spot.reviewCount ?? "0"} reviews
                </span>
              </div>
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed text-sm">
              {spot.fullDescription || "No description available."}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {spot.openingHours || "Timings vary"}
              </span>
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4" /> {spot.priceRange || "Price varies"}
              </span>
            </div>

          {spot.ambassadorId && <AmbassadorInfo ambassadorId={spot.ambassadorId} />}
        </div>

        {spot.id && <ReviewsPreview spotId={spot.id} />}
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-20">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex justify-center bg-black text-white py-4 rounded-full shadow-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Get Directions
        </a>
      </div>

      <Suspense fallback={null}>
        <LoginPromptModal
          open={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
        />
      </Suspense>
    </motion.div>
  );
}

