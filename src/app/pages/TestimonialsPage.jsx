"use client";

import Image from "next/image";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

const ReviewCard = ({ image, title, comments, className = "" }) => (
  <div className={`h-full ${className}`}>
    <div className="bg-white p-8 rounded-xl shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-lg">
      {/* Testimonial Text at the top */}
      <div className="min-h-[180px] mb-6 flex items-start">
        <p className="text-gray-600 text-center text-lg leading-relaxed line-clamp-5 overflow-hidden text-ellipsis">
          &quot;{comments}&quot;
        </p>
      </div>
      
      {/* Image in the middle */}
      <div className="relative w-28 h-28 mx-auto mb-8">
        <Image
          src={image || '/placeholder-avatar.png'}
          alt={title}
          fill
          className="object-cover rounded-full"
          sizes="112px"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-avatar.png';
          }}
        />
      </div>
      
      {/* Name and title at the bottom */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
      </div>
    </div>
  </div>
);

const TestimonialsPage = () => {
  const { siteSettings, isLoading, error } = useSiteSettings();
  const [currentReviews, setCurrentReviews] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  
  // Get all available reviews
  const allReviews = useMemo(() => {
    return siteSettings?.reviews?.review || [];
  }, [siteSettings]);

  // Function to get 4 random reviews
  const getRandomReviews = useCallback(() => {
    if (allReviews.length <= 4) return [...allReviews];
    const shuffled = [...allReviews].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [allReviews]);

  // Set up intersection observer to pause animation when not in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    const currentContainer = containerRef.current;
    
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, []);

  // Set up the interval to cycle through reviews
  useEffect(() => {
    if (allReviews.length === 0) return;

    const cycleReviews = () => {
      setCurrentReviews(prevReviews => {
        if (prevReviews.length < 2) return getRandomReviews();
        // Rotate the array to switch places
        return [...prevReviews.slice(1), prevReviews[0]];
      });
    };

    // Initial set of reviews
    if (currentReviews.length === 0) {
      setCurrentReviews(getRandomReviews());
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Only set interval if component is visible
    if (isVisible) {
      intervalRef.current = setInterval(cycleReviews, 7000);
    }
    
    // Clean up
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [allReviews, getRandomReviews, isVisible, currentReviews.length]);

  // Don't show anything if there are no reviews and not loading
  if (!isLoading && !error && allReviews.length === 0) {
    return null;
  }

  return (
    <div className="w-full" id="testimonials">
      {/* Primary Color Panel */}
      <div className="w-full bg-primary pt-20 pb-60 relative">
        <div className="absolute top-0 left-0 right-0 pt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">What do our patients say?</h1>
            <div className="w-20 h-1 bg-white mx-auto"></div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section - Only show if there are reviews */}
      {!isLoading && !error && allReviews.length > 0 && (
        <section ref={containerRef} className="w-full py-20 px-4 bg-gray-50 -mt-48">
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
                {currentReviews.map((review) => (
                  <div key={review.id} className="transition-all duration-500">
                    <ReviewCard
                      image={review.img}
                      title={review.patient_name}
                      comments={review.review_comments}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Show loading or error state */}
      {isLoading && (
        <section className="w-full py-20 px-4 bg-gray-50 -mt-48">
          <div className="max-w-7xl mx-auto text-center py-12">
            Loading reviews...
          </div>
        </section>
      )}
      
      {error && (
        <section className="w-full py-20 px-4 bg-gray-50 -mt-48">
          <div className="max-w-7xl mx-auto text-center py-12 text-red-500">
            Error loading reviews: {error}
          </div>
        </section>
      )}
    </div>
  );
};

export default TestimonialsPage;

<style jsx global>{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`}</style>
