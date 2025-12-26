import React, { useState, memo } from 'react';
import {
  Star,
  Loader2,
  Trash2,
  ThumbsUp,
  Check,
  User,
} from 'lucide-react';

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export const ReviewCard = memo(
  ({ review, user, onDeleteReview, onMarkHelpful }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);
    
    // Local state for optimistic updates
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
    const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

    const isAuthor = user && review.userId === user.uid;

    const handleDeleteClick = () => {
      if(window.confirm("Are you sure you want to delete this review?")) {
          setIsDeleting(true);
          // You would need to pass the logic for deleting from Firestore here
          // For now, we just set state.
          onDeleteReview(review.id); 
      }
    };

    const handleHelpfulClick = async () => {
      if (!user || hasMarkedHelpful || isMarkingHelpful) return;
      setIsMarkingHelpful(true);
      
      // Simulate API call or call passed function
      // await onMarkHelpful(review.id); 
      
      setHasMarkedHelpful(true);
      setHelpfulCount((prev) => prev + 1);
      setIsMarkingHelpful(false);
    };

    return (
      <div className="bg-white p-0 border-b border-gray-100 pb-6 last:border-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <User size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {review.username}
              </p>
              <div className="flex items-center gap-2">
                 <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        size={12}
                        className={i < (review.rating || 0) ? 'fill-current' : 'text-gray-200'}
                    />
                    ))}
                </div>
                <span className="text-xs text-gray-400">{formatTime(review.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">
          {review.comment}
        </p>

        {review.imageUrl && (
          <div className="mb-4">
            <img
              src={review.imageUrl}
              alt="Review"
              className="w-24 h-24 object-cover rounded-sm border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(review.imageUrl, '_blank')}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={handleHelpfulClick}
            disabled={!user || hasMarkedHelpful || isMarkingHelpful}
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors ${
              hasMarkedHelpful
                ? 'text-green-600 bg-green-50 cursor-default'
                : 'text-gray-400 hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            {isMarkingHelpful ? (
              <Loader2 size={12} className="animate-spin" />
            ) : hasMarkedHelpful ? (
              <Check size={14} />
            ) : (
              <ThumbsUp size={14} />
            )}
            Helpful {helpfulCount > 0 ? `(${helpfulCount})` : ''}
          </button>

          {isAuthor && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="text-xs text-red-400 hover:text-red-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              {isDeleting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete
            </button>
          )}
        </div>
      </div>
    );
  }
);