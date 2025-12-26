import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Rahul Sharma",
      location: "Mumbai",
      text: "I was skeptical about buying Rudraksha online, but the lab certificate gave me peace of mind. The energy during meditation is visibly different.",
      rating: 5,
    },
    {
      id: 2,
      name: "Priya Venkatesh",
      location: "Chennai",
      text: "The Pyrite bracelet is heavy and cold to touch—definite signs of real stone. Delivery took only 3 days to Chennai.",
      rating: 5,
    },
    {
      id: 3,
      name: "Amitabh Das",
      location: "Kolkata",
      text: "Ordered a Sphatik Mala for my mother. She says it stays cool even in summer. Very happy with the authentic quality.",
      rating: 5,
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-black mb-4">
            Loved by Devotees
          </h2>
          <div className="flex justify-center items-center gap-2 text-sm text-gray-600 mt-2">
            <span className="font-bold text-black text-lg">4.9</span>
            <div className="flex text-[var(--color-primary)]">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
            </div>
            <span>from 15,000+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 p-8 rounded-sm hover:shadow-lg transition-shadow duration-300 border border-transparent hover:border-gray-100">
              <div className="flex text-[var(--color-primary)] mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>

              <p className="text-gray-700 font-body text-sm leading-relaxed mb-6">
                "{review.text}"
              </p>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                 <div>
                    <h4 className="font-heading font-bold text-black text-sm">{review.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{review.location}</p>
                 </div>
                 <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
                    <CheckCircle2 size={10} /> Verified
                 </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;