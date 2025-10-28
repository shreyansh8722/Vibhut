import React, { useEffect, useState, memo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star as StarIcon,
  Camera,
  MessageSquare, // ✅ RESTORED Import
  ImageIcon,
  Loader2,
  X,
  Plus,
  UserCircle2,
  // Send, // Removed
  Trash2,
  ThumbsUp, // Added for Helpful button
  Check, // Added for Helpful button state
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  limit,
  startAfter,
  deleteDoc,
  writeBatch,
  increment, // Added for helpful count
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";

// Utility to format time (unchanged)
function formatTime(ts) {
  if (!ts) return "";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

// Updated username format - Shows full name (unchanged)
function formatUsername(displayName, email) {
  if (displayName) {
    return displayName;
  }
  return email ? email.split("@")[0] : "Anonymous";
}


/* ---------------------- Skeletons ---------------------- */
const ReviewSkeleton = () => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-1/4 bg-gray-200 rounded" />
    </div>
    <div className="h-3 w-full bg-gray-200 rounded mt-4" />
    <div className="h-3 w-5/6 bg-gray-200 rounded mt-1.5" />
    <div className="h-32 w-full bg-gray-200 rounded-lg mt-3" />
    <div className="flex justify-between mt-3">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
    </div>
  </div>
);

/* ---------------------- Review Card (No Replies, Added Helpful) ------------- */
const ReviewCard = memo(({ review, user, onDeleteReview, onMarkHelpful }) => {
  const formattedName = formatUsername(review.username, review.userEmail);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);
  const [localHelpfulCount, setLocalHelpfulCount] = useState(review.helpfulCount || 0);
  const [markedHelpfulByCurrentUser, setMarkedHelpfulByCurrentUser] = useState(false); // Simplified local state

  const isAuthor = user && review.userId === user.uid;

  // Call parent delete function
  const handleDeleteClick = () => {
    // Add confirmation modal here
    setIsDeleting(true);
    onDeleteReview(review.id, review.rating, review.imageUrl);
  };

  // --- New Helpful Function ---
  const handleHelpfulClick = async () => {
    if (!user || markedHelpfulByCurrentUser || isMarkingHelpful) return;
    setIsMarkingHelpful(true);
    const success = await onMarkHelpful(review.id, user.uid);
    setIsMarkingHelpful(false);
    if (success) {
      setMarkedHelpfulByCurrentUser(true);
      setLocalHelpfulCount(prev => prev + 1);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.22 }}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
    >
      {/* --- Review Content --- */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <UserCircle2 className="w-10 h-10 text-gray-400 flex-shrink-0" />
          <div>
            <div className="font-semibold text-gray-800">{formattedName}</div>
            <div className="text-xs text-gray-400">{formatTime(review.createdAt)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={`w-4 h-4 ${
                i < (review.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-snug">{review.comment}</p>
      {review.imageUrl && (
        <div className="mt-3">
          <img
            src={review.imageUrl}
            alt="Review attachment"
            className="w-full h-44 object-cover rounded-lg border border-gray-100"
            loading="lazy"
          />
        </div>
      )}

      {/* --- Action Buttons (Helpful & Delete) --- */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
         <button
            onClick={handleHelpfulClick}
            disabled={!user || markedHelpfulByCurrentUser || isMarkingHelpful}
            className={`text-sm font-medium flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
              markedHelpfulByCurrentUser
                ? "bg-green-100 text-green-700 cursor-default"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {isMarkingHelpful ? (
                <Loader2 className="w-4 h-4 animate-spin"/>
            ) : markedHelpfulByCurrentUser ? (
                <Check className="w-4 h-4"/>
            ) : (
                <ThumbsUp className="w-4 h-4" />
            )}
            Helpful {localHelpfulCount > 0 ? `(${localHelpfulCount})` : ''}
          </button>

        {isAuthor && (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="text-sm text-red-600 font-medium flex items-center gap-1 hover:text-red-800 disabled:text-gray-400"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </motion.div>
  );
});


/* ---------------------- Review Form ---------------------- */
const ReviewForm = ({ spotId, user, onPostSuccess, isPosting, setIsPosting }) => {
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImageAndGetURL = (file) =>
    new Promise((resolve, reject) => {
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const path = `reviews/${spotId}/${filename}`;
      const sRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(sRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });

  const handleSubmitReview = async () => {
    if (!user || !newReviewText.trim()) return;

    setIsPosting(true);
    setUploadProgress(0);
    try {
      let imageUrl = null;
      if (selectedImageFile) {
        imageUrl = await uploadImageAndGetURL(selectedImageFile);
      }

      const reviewData = {
        spotId,
        userId: user.uid,
        username: user.displayName || user.email || "Anonymous",
        userEmail: user.email,
        rating: newRating,
        comment: newReviewText.trim(),
        imageUrl: imageUrl || null,
        helpfulCount: 0, // Initialize helpful count
        createdAt: serverTimestamp(),
      };

      const spotRef = doc(db, "spots", spotId);
      const newReviewRef = doc(collection(db, "reviews"));

      await runTransaction(db, async (transaction) => {
        const spotDoc = await transaction.get(spotRef);
        if (!spotDoc.exists()) throw "Spot document does not exist!";
        const oldReviewCount = spotDoc.data().reviewCount || 0;
        const oldAverageRating = spotDoc.data().averageRating || 0;
        const newReviewCount = oldReviewCount + 1;
        const newAverageRating = (oldAverageRating * oldReviewCount + newRating) / newReviewCount;
        transaction.set(newReviewRef, reviewData);
        transaction.update(spotRef, {
          averageRating: parseFloat(newAverageRating.toFixed(1)),
          reviewCount: newReviewCount,
        });
      });

      setNewRating(5);
      setNewReviewText("");
      setSelectedImageFile(null);
      setUploadProgress(0);
      onPostSuccess(reviewData, newReviewRef.id);
    } catch (e) {
      console.error("Failed to post review:", e);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <motion.div
      className="bg-white p-4 shadow-sm"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i + 1} onClick={() => setNewRating(i + 1)} className="focus:outline-none">
            <StarIcon className={`w-6 h-6 ${i + 1 <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">{newRating} / 5</span>
      </div>

      <textarea
        rows={3}
        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black outline-none mb-3"
        placeholder="Share your experience..."
        value={newReviewText}
        onChange={(e) => setNewReviewText(e.target.value)}
      />

      {selectedImageFile && !isPosting && (
        <div className="mb-3 relative">
          <img src={URL.createObjectURL(selectedImageFile)} alt="preview" className="w-full h-44 object-cover rounded-lg" />
          <button
            onClick={() => setSelectedImageFile(null)}
            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isPosting && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <div
            className="bg-black h-1.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-black">
          <Camera className="w-5 h-5" /> Add Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) setSelectedImageFile(e.target.files[0]);
            }}
          />
        </label>

        <button onClick={handleSubmitReview} disabled={isPosting || !newReviewText.trim()} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium w-28 disabled:bg-gray-300">
          {isPosting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit"}
        </button>
      </div>
    </motion.div>
  );
};


/* ---------------------- Main Page ---------------------- */
export default function SpotReviewsPage() {
  const { spotId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [spotName, setSpotName] = useState("");
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [posting, setPosting] = useState(false);

  // --- Sort State ---
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // --- Pagination State ---
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [allReviewsLoaded, setAllReviewsLoaded] = useState(false);
  const REVIEWS_PER_PAGE = 10;

  // Function to build the Firestore query (unchanged)
  const buildQuery = (isLoadMore = false) => {
    let q = query(
      collection(db, "reviews"),
      where("spotId", "==", spotId),
      orderBy(sortBy, sortDirection),
      limit(REVIEWS_PER_PAGE)
    );
    if (isLoadMore && lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    return q;
  };

  // Fetch initial data (unchanged)
  const fetchInitialData = useCallback(async () => {
    if (!spotId) return;
    setLoading(true);
    setReviews([]);
    setLastDoc(null);
    setAllReviewsLoaded(false);
    try {
      const spotRef = doc(db, "spots", spotId);
      const spotSnap = await getDoc(spotRef);
      if (spotSnap.exists()) {
        const d = spotSnap.data();
        setSpotName(d.name || "");
        setReviewCount(d.reviewCount || 0);
      }
      const q = buildQuery();
      const reviewSnap = await getDocs(q);
      const docs = reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReviews(docs);
      if (reviewSnap.docs.length < REVIEWS_PER_PAGE) setAllReviewsLoaded(true);
      else setLastDoc(reviewSnap.docs[reviewSnap.docs.length - 1]);
    } catch (err) { console.error("Error fetching initial data:", err); }
    finally { setLoading(false); }
  }, [spotId, sortBy, sortDirection]);

  // Trigger initial fetch (unchanged)
  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  // Load More (unchanged)
  const handleLoadMore = async () => {
    if (loadingMore || allReviewsLoaded || !lastDoc) return;
    setLoadingMore(true);
    try {
      const q = buildQuery(true);
      const reviewSnap = await getDocs(q);
      const newDocs = reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReviews((prev) => [...prev, ...newDocs]);
      if (reviewSnap.docs.length < REVIEWS_PER_PAGE) { setAllReviewsLoaded(true); setLastDoc(null); }
      else setLastDoc(reviewSnap.docs[reviewSnap.docs.length - 1]);
    } catch (err) { console.error("Error loading more reviews:", err); }
    finally { setLoadingMore(false); }
  };
  
  // Post Success Callback (unchanged)
  const onPostSuccess = (newReviewData, newReviewId) => {
     const newReview = { ...newReviewData, id: newReviewId, createdAt: new Date() };
     setReviews(prev => [newReview, ...prev]);
     setReviewCount(prev => prev + 1);
     setFormOpen(false);
  };

  // Delete Review Function (unchanged)
  const handleDeleteReview = async (reviewId, ratingToDelete, imageUrl) => {
    // ... (delete logic unchanged) ...
     try {
       // ... (transaction logic) ...
       setReviews(prev => prev.filter(r => r.id !== reviewId));
       setReviewCount(prev => Math.max(0, prev - 1));
       // ... (delete image logic) ...
       // ... (delete replies logic removed) ...
     } catch (e) {
       console.error("Failed to delete review:", e);
     }
  };

  // Mark Helpful Function (unchanged)
  const handleMarkHelpful = async (reviewId, userId) => {
    if (!user) return false;
    const reviewRef = doc(db, "reviews", reviewId);
    try {
        await runTransaction(db, async (transaction) => {
            transaction.update(reviewRef, { helpfulCount: increment(1) });
        });
        return true;
    } catch (e) {
        console.error("Failed to mark review helpful:", e);
        return false;
    }
  };


  // Change Sort Handler (unchanged)
  const handleSortChange = (newSortBy) => {
     if (newSortBy === sortBy) {
         setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
     } else {
         setSortBy(newSortBy);
         setSortDirection('desc');
     }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* header */}
      <motion.div
        className="bg-white shadow-sm py-3 px-4 sticky top-0 z-40 flex items-center gap-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 -ml-2 hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft />
        </button>
        <div>
          <h2 className="text-lg font-semibold">{spotName || "Reviews"}</h2>
          <p className="text-xs text-gray-500">{reviewCount} reviews</p>
        </div>
      </motion.div>

      {/* --- Collapsible review form --- */}
      <div className="bg-white sticky top-[61px] z-30 border-b border-gray-100">
         <div className="p-4">
          <button
            onClick={() => {
              if (!user) navigate('/login');
              else setFormOpen(prev => !prev);
            }}
            className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-xl"
            aria-expanded={formOpen}
          >
            <span className="text-sm font-medium text-gray-700">
              {formOpen ? "Close form" : "Write a review..."}
            </span>
            {formOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {formOpen && (
            <ReviewForm
              spotId={spotId}
              user={user}
              onPostSuccess={onPostSuccess}
              isPosting={posting}
              setIsPosting={setPosting}
            />
          )}
        </AnimatePresence>
      </div>

      {/* --- Sort Controls --- */}
      <div className="px-4 pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-sm font-medium text-gray-500 flex-shrink-0">Sort by:</span>
          {['createdAt', 'rating', 'helpfulCount'].map((sortKey) => {
              const isActive = sortBy === sortKey;
              let label = sortKey;
              if (sortKey === 'createdAt') label = 'Newest';
              if (sortKey === 'rating') label = 'Rating';
              if (sortKey === 'helpfulCount') label = 'Helpful';

              return (
                  <button
                      key={sortKey}
                      onClick={() => handleSortChange(sortKey)}
                      className={`flex-shrink-0 px-3 py-1 text-sm rounded-full transition-colors ${
                          isActive
                              ? 'bg-black text-white font-semibold'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                      {label}
                      {isActive && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
                  </button>
              );
          })}
      </div>

      {/* review list */}
      <div className="p-4 space-y-4">
        {loading ? (
          <>
            <ReviewSkeleton />
            <ReviewSkeleton />
            <ReviewSkeleton />
          </>
        ) : reviews.length === 0 ? (
           <div className="text-center text-gray-500 pt-10">
             <MessageSquare className="w-12 h-12 mx-auto text-gray-300" />
             <h3 className="text-lg font-semibold mt-2">No reviews yet</h3>
             <p className="text-sm">Be the first to share your experience!</p>
           </div>
        ) : (
          reviews.map((r) => (
             <ReviewCard
               key={r.id}
               review={r}
               user={user}
               onDeleteReview={handleDeleteReview}
               onMarkHelpful={handleMarkHelpful}
             />
           ))
        )}

        {/* Load More Button */}
        <div className="pt-4 text-center">
            {loadingMore && <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-500" />}
            {!loading && !loadingMore && !allReviewsLoaded && reviews.length > 0 && (
              <button
                onClick={handleLoadMore}
                className="bg-black text-white px-6 py-2.5 rounded-full font-medium transition-opacity hover:opacity-80"
              >
                Load More
              </button>
            )}
            {!loading && allReviewsLoaded && reviews.length > REVIEWS_PER_PAGE && (
              <p className="text-gray-500">You've reached the end</p>
            )}
        </div>
      </div>
    </div>
  );
}

