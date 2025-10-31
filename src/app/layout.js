"use client"

import localFont from "next/font/local";
import "./globals.css";
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import { useState, useEffect } from "react";
import Head from "next/head";

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

function LayoutContent({ children }) {
  const { siteSettings, isLoading } = useSiteSettings();
  const [title, setTitle] = useState("Lumina Blue");

  useEffect(() => {
    if (siteSettings?.name) {
      setTitle(siteSettings.name);
    }


  }, [siteSettings]);

  return (
    <html lang="en">
      <Head>
        <title>{isLoading ? "Loading..." : title}</title>
        <meta name="description" content="Short description of the page (155-160 chars)" />
        <meta name="keywords" content="keyword1, keyword2, keyword3" />
        
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charset="UTF-8" />



        {/* Open Graph Meta Tags */}

        <meta property="og:title" content="Page Title" />
        <meta property="og:description" content="Short description of the page" />
        <meta property="og:url" content="https://lumina-blue-master.vercel.app/67" />
        <meta property="og:type" content="website" /> 
       {siteSettings?.banners?.[0]?.bannerImg && (
    <meta property="og:image" content="{{siteSettings.banners[0].bannerImg}}" />
  )}
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1920" />
        <meta property="og:image:height" content="600" />
    
        


        
      </Head>
      
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen w-full`}>
        <main className="flex-grow w-full relative">
          {children}
        </main>
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
