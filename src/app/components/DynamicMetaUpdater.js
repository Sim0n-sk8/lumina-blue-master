"use client";

import { useEffect } from "react";
import { useSiteSettings } from "../context/SiteSettingsContext";

const S3_BASE = "https://s3.eu-west-2.amazonaws.com/luminablue-blogs";

export function DynamicMetaUpdater() {
  const { siteSettings, isLoading, error } = useSiteSettings();

  useEffect(() => {
    if (isLoading || error || !siteSettings) return;

    const siteName = siteSettings.name || siteSettings.short_name || "Lumina Blue";

    // Update document title
    document.title = siteName;

    // Helper to create/update meta tags
    const setMeta = (attr, key, value) => {
      if (!value) return;
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    };

    // Description
    const description =
      siteSettings.aboutText ||
      siteSettings.about?.body ||
      `${siteName} - Eye care services in ${siteSettings.city || "your area"}`;

    // Open Graph / Twitter image
    const ogImageRaw =
      siteSettings.banners?.[0]?.bannerImg ||
      siteSettings.banners?.[0]?.img ||
      siteSettings.about?.image ||
      siteSettings.about?.img ||
      siteSettings.brands?.[0]?.img;

    const ogImage = ogImageRaw
      ? ogImageRaw.startsWith("http")
        ? ogImageRaw
        : `${S3_BASE}/${ogImageRaw}`
      : "/default-banner.jpg";

    // Meta tags
    setMeta("name", "description", description);
    setMeta("property", "og:title", siteName);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", siteName);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    // Location-specific OG
    if (siteSettings.address_1) setMeta("property", "og:street-address", siteSettings.address_1);
    if (siteSettings.city) setMeta("property", "og:locality", siteSettings.city);
    if (siteSettings.state) setMeta("property", "og:region", siteSettings.state);
    if (siteSettings.zip) setMeta("property", "og:postal-code", siteSettings.zip);

    // Theme & contact
    const themeColor = siteSettings.primaryColor || "#2196f3";
    setMeta("name", "theme-color", themeColor);
    if (siteSettings.tel) setMeta("name", "telephone", siteSettings.tel);
    if (siteSettings.email) setMeta("name", "email", siteSettings.email);

    // Optional: update favicon color (some browsers support it)
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.setAttribute("color", themeColor);
  }, [siteSettings, isLoading, error]);

  return null;
}
