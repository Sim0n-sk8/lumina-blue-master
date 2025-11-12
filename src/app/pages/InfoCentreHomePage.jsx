import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "../context/SiteSettingsContext";
import Navbar from "./Navbar";

const FALLBACK_IMAGE = 'https://via.placeholder.com/800x500.png?text=Image+Not+Available';

const InfoCentreHomePage = ({ clean = false }) => {
  const { siteSettings } = useSiteSettings();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [basePath, setBasePath] = useState('');

  // Determine the base path based on the current URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      
      // Check if we're in a practice ID or customer code route
      if (pathSegments.length > 0 && pathSegments[0] !== 'info_centre') {
        setBasePath(`/${pathSegments[0]}`);
      } else {
        setBasePath('');
      }
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('https://www.ocumail.com/api/section_categories');
        if (!response.ok) {
          const errorMessage = `Network response was not ok: ${response.statusText}`;
          console.error(errorMessage);
          setError(errorMessage);
          setLoading(false);
          return;
        }
        let allCategories = await response.json();
        // Sort categories by orderby in ascending order (lower numbers first)
        allCategories.sort((a, b) => (a.orderby || 0) - (b.orderby || 0));
        
        // Fetch details for each category to get thumbnail URLs
        const fetchedCategories = await Promise.all(
          allCategories.map(async (category) => {
            try {
              const response = await fetch(`https://www.ocumail.com/api/section_categories/${category.id}`);
              if (!response.ok) {
                if (response.status === 404) {
                  console.warn(`Category with ID ${category.id} not found`);
                  return null;
                }
                console.error(`Network response was not ok for ID: ${category.id}`, response.statusText);
                return null;
              }
              const data = await response.json();
              return {
                id: data.id,
                name: data.name,
                thumbnailImgUrl: data.thumbnail_img_url,
              };
            } catch (error) {
              console.error(`Error fetching category ${category.id}:`, error);
              return null;
            }
          })
        );
        setCategories(fetchedCategories.filter(category => category !== null));
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = async (id) => {
    setSelectedCategoryId(id);
    try {
      const response = await fetch(`https://www.ocumail.com/api/section_items/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('The requested item could not be found. Retrying...');
          setTimeout(() => handleCategoryClick(id), 3000);
        } else {
          console.error(`Network response was not ok for ID: ${id}`, response.statusText);
        }
        return;
      }
      const data = await response.json();
      setSubcategories(data.items);
    } catch (error) {
      console.error(`Error fetching subcategories for ID: ${id}`, error);
      setTimeout(() => handleCategoryClick(id), 3000);
    }
  };

  const getCategoryDescription = (categoryName) => {
    const descriptions = {
      'Refractive conditions': 'Discover how nearsightedness, farsightedness, and astigmatism shape your world and the innovative solutions to see clearly again.',
      'Rx lens options': 'Explore the perfect lens match for your lifestyle, from sleek single vision to versatile progressives - clarity has never looked so good!',
      'External & lid pathology': "Get the lowdown on common eyelid conditions and how to keep your eyes feeling fresh and comfortable.",
      'Anterior segment': 'Dive into the fascinating world of the eye\'s front surface and discover how it affects your vision and comfort.',
      'Posterior segment': 'Explore the inner workings of the eye and learn how the retina and optic nerve team up to create your vision.',
      'General Eyecare': 'Bright eyes start here! Your go-to guide for keeping your vision sharp and your eyes healthy at every stage of life.',
      'Pharmaceuticals': "Your eyes' best defense! Navigate the world of eye medications with confidence, knowing what works and why.",
      'Contact Lenses': 'Freedom to see, freedom to be! Find your perfect contact lens match and embrace life without the frames.'
    };

    return descriptions[categoryName] || `Discover more about ${categoryName} and how it impacts your vision.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!clean && <Navbar practiceId={siteSettings?.practiceId} />}
      {/* Hero Section */}
      <div className="w-full h-[500px] bg-[url('https://www.imageeyecareoptometrists.com/assets/info_centre_banner-4940284541b3ff321b2a3d735fc5ef1caa0f4c66de9804905118656edf31c88d.jpg')] bg-cover bg-center text-white">
        <div className="h-full bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-center px-4">Welcome To Our Info Centre</h1>
        </div>
      </div>

      {/* Stacked Category Blocks */}
      <div className="py-16 px-4 bg-gray-100">
        <div className="max-w-7xl mx-auto space-y-20">
          {categories.map((category, index) => {
            return (
              <div key={category.id} className="w-full p-6 bg-white rounded-lg border border-gray-200 shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-lg">
                <div className="w-full flex flex-col md:flex-row items-center">
                  {/* Image Section - Order changes based on index */}
                  <div className={`w-full md:w-1/2 ${index % 2 !== 0 ? 'md:order-2' : ''} p-4`}>
                    <Link 
                      href={`${basePath}/info_centre/list/${category.id}`}
                      onClick={() => handleCategoryClick(category.id)}
                      className="block"
                    >
                      <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-md">
                        {category.thumbnailImgUrl && (
                          <Image
                            src={category.thumbnailImgUrl || FALLBACK_IMAGE}
                            alt={category.name}
                            layout="fill"
                            className="object-cover transition-transform duration-200 transform hover:scale-102"
                            priority
                            onError={(e) => {
                              // Prevent infinite loop by setting a flag
                              if (e.target.src !== FALLBACK_IMAGE) {
                                e.target.src = FALLBACK_IMAGE;
                              }
                            }}
                          />
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Text Section - Order changes based on index */}
                  <div className={`w-full md:w-1/2 p-4 text-center md:text-left ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                  <Link 
                    href={`${basePath}/info_centre/list/${category.id}`}
                    onClick={() => handleCategoryClick(category.id)}
                    className="inline-block"
                  >
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{category.name}</h2>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed line-clamp-2">
                      {getCategoryDescription(category.name)}
                    </p>
                    <span className={`inline-block px-6 py-3 text-base rounded-full shadow-sm transition-all duration-200 transform hover:scale-103 ${
                      clean 
                        ? 'bg-black text-white hover:bg-gray-800' 
                        : 'bg-primary text-white hover:bg-opacity-90'
                    }`}>
                      Explore {category.name}
                    </span>
                  </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InfoCentreHomePage;
