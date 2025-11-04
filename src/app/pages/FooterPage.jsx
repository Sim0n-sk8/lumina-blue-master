"use client";

import { FaFacebook, FaInstagram, FaLinkedin, FaPinterest, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaTiktok, FaGoogle } from 'react-icons/fa';
import { useSiteSettings } from "../context/SiteSettingsContext";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const FooterPage = () => {
  const { siteSettings } = useSiteSettings();
  const [blogs, setBlogs] = useState([]);
  const [licenseType, setLicenseType] = useState(null);

  // Fetch license info with better error handling
  useEffect(() => {
    let isMounted = true;
    
    async function fetchLicense() {
      if (!siteSettings?.practiceId) return;
      
      try {
        const res = await fetch(`/api/${siteSettings.practiceId}/check_licence`);
        
        // Handle non-OK responses gracefully
        if (!res.ok) {
          console.warn(`License API returned ${res.status}: ${res.statusText}`);
          if (isMounted) setLicenseType(null);
          return;
        }
        
        const data = await res.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setLicenseType(data?.product_type || null);
        }
      } catch (err) {
        console.error("Error checking license:", err);
        if (isMounted) setLicenseType(null);
      }
    }
    
    fetchLicense();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [siteSettings?.practiceId]);

  // Fetch blogs only if license is NOT Comprehensive
  useEffect(() => {
    if (licenseType === "Comprehensive") return;
    if (!siteSettings?.practiceId) return;
    
    let isMounted = true;
    
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`/api/${siteSettings.practiceId}/blogs`);
        
        // Handle non-OK responses gracefully
        if (!response.ok) {
          console.warn(`Blogs API returned ${response.status}: ${response.statusText}`);
          if (isMounted) setBlogs([]);
          return;
        }
        
        const data = await response.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Ensure data is an array before processing
          const blogsArray = Array.isArray(data) ? data : [];
          const sortedBlogs = blogsArray
            .filter(blog => blog?.date) // Safely filter out invalid entries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 2);
          setBlogs(sortedBlogs);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        if (isMounted) setBlogs([]);
      }
    };
    
    fetchBlogs();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [siteSettings?.practiceId, licenseType]);

  // State to manage path segments and routing
  const [routing, setRouting] = useState({
    isCustomerCodeRoute: false,
    customerCode: null,
    isClient: false
  });

  // Set up client-side routing after mount
  useEffect(() => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const isCustomerCodeRoute = pathSegments[0] && !/^\d+$/.test(pathSegments[0]);
    
    setRouting({
      isCustomerCodeRoute,
      customerCode: isCustomerCodeRoute ? pathSegments[0] : null,
      isClient: true
    });
  }, []);

  // Helper function to get the correct blog path
  const getBlogPath = (blogId) => {
    if (!routing.isClient) return '#'; // Return a safe default during SSR
    
    const basePath = routing.isCustomerCodeRoute 
      ? routing.customerCode 
      : siteSettings?.practiceId;
      
    return `/${basePath}/blog/${blogId}`;
  };

  const getLink = (path) => {
    if (!routing.isClient) return path; // Return path as-is during SSR
    
    if (routing.isCustomerCodeRoute && routing.customerCode) {
      // For customer code routes, use the customer code from the URL
      return `/${routing.customerCode}${path}`;
    } else if (siteSettings?.practiceId) {
      // For regular practiceId routes
      return `/${siteSettings.practiceId}${path}`;
    }
    
    // Fallback to the path as-is if we can't determine the route type
    return path;
  };

  // Determine whether to show the News column
  const showNewsColumn = licenseType !== "Comprehensive";

  return (
    <footer className="w-full py-12" style={{ backgroundColor: "#363636" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-2 gap-y-8">
          {/* Column 1: Logo with text */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center">
              {siteSettings?.about?.logo_light ? (
                <Image 
                  src={siteSettings.about.logo_light} 
                  alt={siteSettings?.name || 'Practice Logo'} 
                  width={200}
                  height={50}
                  className="h-12 w-auto" 
                  onError={(e) => {
                    // Hide the image if it fails to load
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-12 w-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  No logo available
                </div>
              )}
            </div>
            <p className="text-white">
              Stay connected to our practice via our social platforms.
            </p>
            <div className="flex space-x-4">
              {siteSettings?.facebook_url?.trim() && (
                <a 
                  href={siteSettings.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebook className="h-6 w-6" />
                </a>
              )}
              {siteSettings?.instagram_url?.trim() && (
                <a href={siteSettings.instagram_url} className="text-primary hover:text-white">
                  <FaInstagram className="h-6 w-6" />
                </a>
              )}
              {typeof siteSettings.linkedin_url === 'string' && siteSettings.linkedin_url.trim() !== "" && (
                <a href={siteSettings.linkedin_url} className="text-primary hover:text-white">
                  <FaLinkedin className="h-6 w-6" />
                </a>
              )}
              {typeof siteSettings.tiktok_url === 'string' && siteSettings.tiktok_url.trim() !== "" && (
                <a href={siteSettings.tiktok_url} className="text-primary hover:text-white">
                  <FaTiktok className="h-6 w-6" />
                </a>
              )}
              {typeof siteSettings.google_business_profile_url === 'string' && siteSettings.google_business_profile_url.trim() !== "" && (
                <a href={siteSettings.google_business_profile_url} className="text-primary hover:text-white">
                  <FaGoogle className="h-6 w-6" />
                </a>
              )}
              {typeof siteSettings.pinterest_url === 'string' && siteSettings.pinterest_url.trim() !== "" && (
                <a href={siteSettings.pinterest_url} className="text-primary hover:text-white">
                  <FaPinterest className="h-6 w-6" />
                </a>
              )}
              {typeof siteSettings.whatsapp_tel === 'string' && siteSettings.whatsapp_tel.trim() !== "" && (
                <a 
                  href={`https://wa.me/${siteSettings.whatsapp_tel.replace(/[^0-9]/g, '')}`}
                  className="text-primary hover:text-white"
                >
                  <FaWhatsapp className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 lg:col-start-5">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href={getLink("/")} className="text-white hover:text-primary">Home</Link></li>
              <li><Link href={getLink("/#about")} className="text-white hover:text-primary">About</Link></li>
              <li><Link href={getLink("/#services")} className="text-white hover:text-primary">Services</Link></li>
              <li><Link href={getLink("/#team")} className="text-white hover:text-primary">Team</Link></li>
              <li><Link href={getLink("/#testimonials")} className="text-white hover:text-primary">Feedback</Link></li>
            </ul>
          </div>

          {/* Column 3: Latest Blog Posts */}
          {showNewsColumn && (
          <div className="lg:col-span-4 lg:col-start-7">
            <h3 className="text-lg font-semibold text-white mb-4">Recent News</h3>
            <div className="space-y-4">
              {blogs.map(blog => (
                <div key={blog.id} className="border-b border-gray-700 pb-4 mb-4">
                  <div className="flex gap-4">
                    {(blog.thumbnail_image?.url || blog.header_image?.url) && (
                      <Link 
                        href={getBlogPath(blog.id)}
                        className="flex-shrink-0 w-20 h-20 rounded overflow-hidden"
                      >
                        <Image
                          src={blog.thumbnail_image?.url || blog.header_image?.url || '/placeholder-blog.jpg'}
                          alt={blog.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-blog.jpg';
                          }}
                        />
                      </Link>
                    )}
                    <div className="flex-1">
                      <Link href={getBlogPath(blog.id)}>
                        <div className="text-[var(--primary-color)] hover:text-white font-medium line-clamp-2 mb-1">
                          {blog.title}
                        </div>
                      </Link>
                      <div className="text-sm text-gray-400">{blog.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Column 4: Get In Touch */}
          <div className="lg:col-span-3 lg:col-start-11">
            <h3 className="text-lg font-semibold text-white mb-4">Get In Touch</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <FaMapMarkerAlt className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                <p className="text-white">{siteSettings.address_1}</p>
              </div>
              <div className="flex items-center">
                <FaPhone className="h-5 w-5 text-primary mr-3" />
                <a href={`tel:${siteSettings.tel}`} className="text-white hover:text-primary">{siteSettings.tel}</a>
              </div>
              <div className="flex items-center min-w-0">
                <FaEnvelope className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                <a 
                  href={`mailto:${siteSettings.email}`} 
                  className="text-white hover:text-primary whitespace-nowrap overflow-hidden text-ellipsis block"
                  title={siteSettings.email}
                >
                  {siteSettings.email}
                </a>
              </div>              
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white text-md">
              &copy; {new Date().getFullYear()}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href={getLink("/privacy")} className="text-white hover:text-primary whitespace-nowrap px-2">
              Privacy Policy
            </Link>
            <Link href={getLink("/paia")} className="text-white hover:text-primary whitespace-nowrap px-2">
              PAIA Manual
            </Link>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterPage;