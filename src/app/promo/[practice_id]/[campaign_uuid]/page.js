'use client';

import { useEffect, useState } from 'react';

// This is a client component that receives params from the layout
export default function PromoRedirect({ params }) {
  const [routeParams, setRouteParams] = useState({ practice_id: null, campaign_uuid: null });
  
  // Update route params when they're available
  useEffect(() => {
    if (params) {
      setRouteParams({
        practice_id: params.practice_id,
        campaign_uuid: params.campaign_uuid
      });
    }
  }, [params]);
  
  const { practice_id, campaign_uuid } = routeParams;
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [practiceData, setPracticeData] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const fetchData = async () => {
      try {
        // Fetch practice data
        const response = await fetch(
          `https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`,
          { 
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            next: { revalidate: 3600 }
          }
        );

        if (!response.ok) {
          throw new Error('Practice not found');
        }

        const data = await response.json();
        const website = data?.website;

        // If we have a website URL, redirect to it with the full path
        if (website) {
          // Ensure the URL has a trailing slash, then append the full path
          const baseUrl = website.endsWith('/') ? website : `${website}/`;
          const targetUrl = new URL(`promo/${practice_id}/${campaign_uuid}`, baseUrl).toString();
          
          // Use window.location for client-side redirect
          window.location.href = targetUrl;
          return; // Prevent further execution
        } else {
          setError('No website URL found for this practice');
          setPracticeData(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'An error occurred while processing your request');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [practice_id, campaign_uuid, isMounted]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign information...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback in case no conditions are met
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Loading...</h1>
      </div>
    </div>
  );
}
