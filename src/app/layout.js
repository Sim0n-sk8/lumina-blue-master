"use client";

import localFont from "next/font/local";
import "./globals.css";
import { SiteSettingsProvider, useSiteSettings } from "./context/SiteSettingsContext";
import { useState, useEffect } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function DynamicMeta() {
  const { siteSettings, isLoading } = useSiteSettings();

  useEffect(() => {
    if (isLoading || !siteSettings) return;

    // Set title
    document.title = siteSettings.name || "Lumina Blue";

    // Helper to update or create meta tags
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

    setMeta("name", "description", siteSettings.description || "Welcome to Lumina Blue");
    setMeta("property", "og:title", siteSettings.name);
    setMeta("property", "og:description", siteSettings.description || "Eye care reimagined.");
    setMeta("property", "og:image", siteSettings.bannerUrl || "/default-banner.jpg");
    setMeta("name", "theme-color", siteSettings.mainColor || "#ffffff");
  }, [siteSettings, isLoading]);

  return null; // nothing visual
}

function LayoutContent({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen w-full`}
      >
        <DynamicMeta />
        <main className="flex-grow w-full relative">{children}</main>
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <SiteSettingsProvider>
      <LayoutContent>{children}</LayoutContent>
    </SiteSettingsProvider>
  );
}
