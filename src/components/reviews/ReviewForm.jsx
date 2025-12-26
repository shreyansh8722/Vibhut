import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Camera, Loader2, X } from 'lucide-react';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  collection,
  doc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';

export const ReviewForm = ({
  spotId, // This is the productId
  user,
  onPostSuccess,
  isPosting,
  setIsPosting,
}) => {
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImageAndGetURL = (file) =>
    new Promise((resolve, reject) => {
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const path = `reviews/${spotId}/${filename}`;
      const sRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(sRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
        username: user.displayName || user.email.split('@')[0] || 'Anonymous',
        userEmail: user.email,
        rating: newRating,
        comment: newReviewText.trim(),
        imageUrl: imageUrl || null,
        helpfulCount: 0,
        createdAt: serverTimestamp(),
      };

      const productRef = doc(db, 'products', spotId);
      const newReviewRef = doc(collection(db, 'reviews'));

      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) throw 'Product document does not exist!';
        
        const data = productDoc.data();
        const oldReviewCount = data.reviewCount || 0;
        const oldAverageRating = data.averageRating || 0;
        
        // Calculate new average
        const newReviewCount = oldReviewCount + 1;
        const newAverageRating =
          ((oldAverageRating * oldReviewCount) + newRating) / newReviewCount;
          
        transaction.set(newReviewRef, reviewData);
        transaction.update(productRef, {
          averageRating: parseFloat(newAverageRating.toFixed(1)),
          reviewCount: newReviewCount,
        });
      });

      setNewRating(5);
      setNewReviewText('');
      setSelectedImageFile(null);
      setUploadProgress(0);
      onPostSuccess(); // Callback to close form
    } catch (e) {
      console.error('Failed to post review:', e);
      alert("Failed to post review. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <motion.div
      className="bg-white p-4 rounded-sm border border-gray-200 mb-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setNewRating(i + 1)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={24}
              className={`${
                i + 1 <= newRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-gray-500 ml-2 font-medium">
          {newRating} / 5
        </span>
      </div>

      <textarea
        rows={3}
        className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:border-[#B08D55] mb-3 bg-gray-50"
        placeholder="Share your experience with this product..."
        value={newReviewText}
        onChange={(e) => setNewReviewText(e.target.value)}
      />

      {selectedImageFile && !isPosting && (
        <div className="mb-3 relative inline-block">
          <img
            src={URL.createObjectURL(selectedImageFile)}
            alt="preview"
            className="w-20 h-20 object-cover rounded-sm border border-gray-200"
          />
          <button
            onClick={() => setSelectedImageFile(null)}
            className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full shadow-sm"
            aria-label="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {isPosting && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <div
            className="bg-[#B08D55] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors">
          <Camera size={18} /> Add Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0])
                setSelectedImageFile(e.target.files[0]);
            }}
          />
        </label>

        <button
          onClick={handleSubmitReview}
          disabled={isPosting || !newReviewText.trim()}
          className="bg-[#B08D55] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#8c6a40] disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {isPosting ? (
            <>Posting <Loader2 size={14} className="animate-spin" /></>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </motion.div>
  );
};