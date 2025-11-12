"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from './Navbar';

const InfoCentreListPage = ({ category }) => {
  const { practiceId } = useParams();
  const router = useRouter();
  const { siteSettings } = useSiteSettings();
  const pathname = usePathname();
  const [sectionItems, setSectionItems] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the current path segments to determine the route type
  const pathSegments = pathname ? pathname.split('/').filter(Boolean) : [];
  
  // Check if we're in the clean route (/info_centre/list/[id])
  const isCleanRoute = pathSegments[0] === 'info_centre' && pathSegments[1] === 'list';
  
  // For regular routes, check if we're using a customer code or practice ID
  const isCustomerCodeRoute = pathSegments[0] && !/^\d+$/.test(pathSegments[0]);
  const isPracticeRoute = pathSegments[0] && /^\d+$/.test(pathSegments[0]);
  
  // Determine the base path for navigation
  let basePath = '';
  if (isCleanRoute) {
    // For clean routes, no base path
    basePath = '';
  } else if (isCustomerCodeRoute) {
    // For customer code routes
    basePath = `/${pathSegments[0]}`;
  } else if (isPracticeRoute) {
    // For practice ID routes
    basePath = `/${pathSegments[0]}`;
  }
  
  // Parse category ID to ensure it's a number
  const categoryId = parseInt(category, 10);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!categoryId || isNaN(categoryId)) {
        setError('Invalid category ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // First, fetch the category details
        const categoryResponse = await fetch(`https://www.ocumail.com/api/section_categories/${categoryId}`);
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category details');
        }
        const currentCategory = await categoryResponse.json();
        
        if (!currentCategory) {
          throw new Error('Category not found');
        }
        
        setCategoryDetails(currentCategory);
        
        // Then fetch the section items for this category
        console.log('Fetching section items for category ID:', categoryId);
        const itemsResponse = await fetch('https://www.ocumail.com/api/section_items');
        if (!itemsResponse.ok) {
          throw new Error('Failed to fetch section items');
        }
        const allItems = await itemsResponse.json();
        console.log('All section items:', allItems);
        
        const filteredItems = allItems.filter(
          (item) => item.section_category_id === categoryId && item.enabled === true
        );
        console.log('Filtered items for category:', filteredItems);
        setSectionItems(filteredItems);
        
      } catch (error) {
        console.error('Error:', error);
        setError(error.message || 'Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [categoryId]);

  // Function to get the base path for navigation
  const getBasePath = () => {
    if (isCleanRoute) return '';
    if (isCustomerCodeRoute && pathSegments[0]) {
      return `/${pathSegments[0]}`;
    }
    return siteSettings?.practiceId ? `/${siteSettings.practiceId}` : '';
  };

  const handleExplore = (itemId, itemName) => {
    const itemPath = isCleanRoute 
      ? `/info_centre/item/${itemId}`
      : `${getBasePath()}/info_centre/${category}/${itemId}`;
    router.push(itemPath);
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


  if (!sectionItems.length && !categoryDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">No items found in this category</p>
      </div>
    );
  }

  // Don't render Navbar for clean route
  const renderNavbar = !isCleanRoute;

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavbar && <Navbar practiceId={siteSettings?.practiceId} />}
      {/* Hero Banner */}
      <div 
        className="w-full h-[600px] bg-cover bg-center text-white"
        style={{
          backgroundImage: `url(${categoryDetails?.banner_img_url || 'https://www.imageeyecareoptometrists.com/assets/info_centre_banner-4940284541b3ff321b2a3d735fc5ef1caa0f4c66de9804905118656edf31c88d.jpg'})`
        }}
      >
        <div className="h-full bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-center px-4">
            {categoryDetails?.name || 'Info Centre'}
          </h1>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="py-6 pb-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="text-xl font-medium">
                <Link 
                  href={`/${practiceId}/info_centre`}
                  className="text-primary underline"
                >
                  Info Centre
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sectionItems.map((item) => (
            <Link 
              key={`item-${item.id}`}
              href={`${getBasePath()}/info_centre/view/${item.id}`}
              className="group flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="p-4">
                <div className="relative h-40 w-full rounded-lg overflow-hidden">
                  <Image
                    src={item.thumbnail_img_url || `https://www.ocumail.com${item.imgurl}`}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">{item.name}</h2>
                <p className="text-gray-600 text-md mb-4 line-clamp-2 flex-grow">
                  {item.body}
                </p>
                <div className="mt-auto">
                  <button
                    className={`w-full px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isCleanRoute 
                        ? 'bg-black text-white hover:bg-gray-800' 
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    Explore {item.name}
                  </button>
                </div>
              </div>
            </Link>
            ))}
          </div>        
      </div>
    </div>
  );
};

export default InfoCentreListPage;
