"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { usePathname } from "next/navigation";

const Navbar = ({ practiceLogo }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [licenseType, setLicenseType] = useState(null);
  const [hideLogo, setHideLogo] = useState(false);
  const { siteSettings } = useSiteSettings();
  const pathname = usePathname();

  // Check if we should hide the logo
  useEffect(() => {
    async function checkLogoSetting() {
      if (!siteSettings?.practiceId) return;
      
      try {
        const response = await fetch(
          `https://www.ocumail.com/api/settings?setting_object_id=${siteSettings.practiceId}&setting_object_type=Practice`
        );
        
        if (response.ok) {
          const settings = await response.json();
          const logoSetting = settings.find(s => s.setting_name === 'HidePracticeLogoOnEyecarePortal');
          if (logoSetting) {
            setHideLogo(logoSetting.setting_value === 't');
          }
        }
      } catch (error) {
        console.error('Error checking logo visibility setting:', error);
      }
    }

    checkLogoSetting();
  }, [siteSettings?.practiceId]);

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

  // Scroll handling
useEffect(() => {
  const handleScroll = () => {
    // If menu is open on mobile, keep sticky and ignore scroll
    if (isMenuOpen) {
      setIsSticky(true);
      setIsScrolled(true);
      return;
    }

    // Otherwise, sticky depends on scroll position
    if (window.scrollY > window.innerHeight * 0.2) {
      setIsSticky(true);
      setIsScrolled(true);
    } else {
      setIsSticky(false);
      setIsScrolled(false);
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  return () => window.removeEventListener("scroll", handleScroll);
}, [isMenuOpen]);

// Menu toggle
const handleMenuToggle = () => {
  setIsMenuOpen(prev => {
    const menuState = !prev;

    if (menuState) {
      // Menu opened =>always sticky
      setIsSticky(true);
    } else {
      //Depends on position
      setIsSticky(window.scrollY > window.innerHeight * 0.2);
    }

    return menuState;
  });
};

 

  const getLink = (path) => {
    // If we don't have a practice ID, return the path as-is
    if (!siteSettings?.practiceId) return path;
    
    // Get the current path from Next.js router
    const currentPath = pathname || '';
    const pathSegments = currentPath.split('/').filter(Boolean);
    
    // Special handling for Info Centre link when in /info_centre/view/[id]/[practiceId] route
    if (path === '/info_centre' && pathSegments[0] === 'info_centre' && pathSegments[1] === 'view' && pathSegments[3]) {
      const practiceId = pathSegments[3];
      return `/info_centre/${practiceId}`;
    }
    
    // Check if we're in a customer code route (first segment is not a number)
    const isCustomerCodeRoute = pathSegments[0] && !/^\d+$/.test(pathSegments[0]);
    
    // If we have a customer code in the URL, use it
    if (isCustomerCodeRoute) {
      const customerCode = pathSegments[0];
      return `/${customerCode}${path}`;
    }
    
    // If we have a customer code in siteSettings but not in URL (e.g., during SSR)
    if (siteSettings.customerCode) {
      return `/${siteSettings.customerCode}${path}`;
    }
    
    // Default to practiceId if no customer code is found
    return `/${siteSettings.practiceId}${path}`;
  };

  // Decide whether to show NEWS FEED
  const showNewsFeed = licenseType !== "Comprehensive";

  // Get the primary color from siteSettings or use a default
  const primaryColor = siteSettings?.primaryColor || 'orange';
  const textHoverStyle = { '--primary-color': primaryColor };

  return (
    <header
      className={`w-full fixed top-0 left-0 z-50 flex justify-between items-center py-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 transition-all ${
        isSticky ? "bg-white shadow-lg text-black" : "bg-transparent text-white"
      }`}
      style={textHoverStyle}
    >
      <div className="flex items-center justify-between w-full">
        {/* Logo */}        
        <div className={hideLogo ? "invisible" : ""}>
          <Link href={getLink("/")} className="flex-shrink-0">
            <Image
              src={
                practiceLogo ||
                (isSticky || isMenuOpen
                  ? siteSettings?.logo_dark || 
                    siteSettings?.about?.logo_dark || 
                    "https://s3.eu-west-2.amazonaws.com/ocumailuserdata/1689179837_67_logo_dark_wide.png"
                  : siteSettings?.logo_light || 
                    siteSettings?.about?.logo_light || 
                    "https://s3.eu-west-2.amazonaws.com/ocumailuserdata/1689179856_67_logo_light_wide.png")
              }
              alt={siteSettings?.name || 'Practice Logo'}
              width={160}
              height={45}
              className="h-auto max-h-12 w-auto"
              priority
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/160x45?text=Logo+Not+Found";
              }}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
<nav className="hidden navfix1:flex items-center font-medium ml-2 sm:ml-4 md:ml-6 lg:ml-8">
        <ul className="flex items-center 
        space-x-4 
        lg:space-x-1 lg:text-sm 
        navfix2:space-x-4 navfix2:text-base"
        >


            <li>
              <Link href={getLink("/")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>HOME</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#about")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>ABOUT</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#services")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>SERVICES</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#team")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>TEAM</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#testimonials")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>FEEDBACK</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/info_centre")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                <b>INFO CENTRE</b>
              </Link>
            </li>

            {showNewsFeed && (
              <li>
                <Link href={getLink("/blog")} className="hover:text-[var(--primary-color)] hover:opacity-80 transition-colors whitespace-nowrap px-2">
                  <b>NEWS FEED</b>
                </Link>
              </li>
            )}
          </ul>

          {isSticky && (
            <div className="ml-4">
              <Link
                href={siteSettings?.practiceId ? `/${siteSettings.practiceId}#booking` : "#booking"}
                className="px-4 py-2 bg-[var(--primary-color)] text-white font-semibold rounded-md hover:bg-white hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] border-2 border-transparent transition-all whitespace-nowrap"
                style={{ '--primary-color': primaryColor }}
              >
                MAKE A BOOKING
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="navfix1:hidden">
          <button className="text-3xl focus:outline-none" onClick={handleMenuToggle} aria-label="Toggle menu">
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 bg-white z-40 mt-16 overflow-y-auto transition-all duration-300 transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <ul className="flex flex-col space-y-6 text-lg font-medium items-center">
            <li>
              <Link href={getLink("/")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>HOME</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#about")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>ABOUT</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#services")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>SERVICES</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#team")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>TEAM</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/#testimonials")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>FEEDBACK</b>
              </Link>
            </li>
            <li>
              <Link href={getLink("/info_centre")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                <b>INFO CENTRE</b>
              </Link>
            </li>

            {showNewsFeed && (
              <li>
                <Link href={getLink("/blog")} className="block py-2 hover:text-[var(--primary-color)] hover:opacity-80 transition-colors" onClick={handleMenuToggle} style={textHoverStyle}>
                  <b>NEWS FEED</b>
                </Link>
              </li>
            )}

            {isSticky && (
              <li className="mt-6">
                <Link
                  href={siteSettings?.practiceId ? `/${siteSettings.practiceId}#booking` : "#booking"}
                  className="inline-block px-6 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-md hover:bg-white hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] border-2 border-transparent transition-all"
                  style={{ '--primary-color': primaryColor }}
                  onClick={handleMenuToggle}
                >
                  <b>MAKE A BOOKING</b>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div> 
    </header>
  );
};

export default Navbar;
