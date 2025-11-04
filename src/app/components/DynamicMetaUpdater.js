
"use client";

import { useEffect } from "react";
import { useSiteSettings } from "../context/SiteSettingsContext";

export function DynamicMetaUpdater() {
  const { siteSettings, isLoading, error } = useSiteSettings();

  useEffect(() => {
    // Don't update if still loading or there's an error
    if (isLoading || error || !siteSettings) {
      console.log("Meta updater waiting...", { isLoading, error, hasSiteSettings: !!siteSettings });
      return;
    }

    console.log("Updating meta tags with site settings:", siteSettings);

    // Update document title
    const siteName = siteSettings.name || siteSettings.short_name || "Lumina Blue";
    document.title = siteName;

    // Helper function to update or create meta tags
    const setMeta = (attr, key, value) => {
      if (!value) return;
      
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
      console.log(`✓ Updated meta ${key}:`, value);
    };

    // Build description from available data
    const description = siteSettings.aboutText || 
                       siteSettings.about?.body || 
                       `${siteName} - Eye care services in ${siteSettings.city || 'your area'}`;

    // Get the first banner image or a default
    const ogImage = siteSettings.banners?.[0]?.bannerImg || 
                   siteSettings.about?.image || 
                   "/default-banner.jpg";

    // Update meta tags
    setMeta("name", "description", description);
    setMeta("property", "og:title", siteName);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:type", "website");
    
    // Add location-specific Open Graph tags
    if (siteSettings.address_1) {
      setMeta("property", "og:street-address", siteSettings.address_1);
    }
    if (siteSettings.city) {
      setMeta("property", "og:locality", siteSettings.city);
    }
    if (siteSettings.state) {
      setMeta("property", "og:region", siteSettings.state);
    }
    if (siteSettings.zip) {
      setMeta("property", "og:postal-code", siteSettings.zip);
    }
    
    // Update theme color based on primary color
    const themeColor = siteSettings.primaryColor || "#2196f3";
    setMeta("name", "theme-color", themeColor);
    
    // Add business-specific meta tags
    if (siteSettings.tel) {
      setMeta("name", "telephone", siteSettings.tel);
    }
    if (siteSettings.email) {
      setMeta("name", "email", siteSettings.email);
    }

    // Add Twitter Card meta tags
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", siteName);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    // Update favicon color based on primary color (if supported)
    const updateFavicon = () => {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon && themeColor) {
        // Some browsers support dynamic favicon color
        favicon.setAttribute('color', themeColor);
      }
    };
    updateFavicon();

    console.log("✅ Meta tags updated successfully");

  }, [siteSettings, isLoading, error]);

  return null;
}