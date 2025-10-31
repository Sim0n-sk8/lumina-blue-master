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
  { !isLoading && siteSettings && (
    <>
      <title>{title}</title>
      <meta name="description" content={siteSettings.description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={siteSettings.description} />
      <meta property="og:url" content={`https://lumina-blue-master.vercel.app/${siteSettings.slug}`} />
      <meta property="og:type" content="website" />
      {siteSettings.banners[0]?.bannerImg && (
        <meta property="og:image" content={siteSettings.banners[0].bannerImg} />
      )}
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1920" />
      <meta property="og:image:height" content="600" />
      <meta property="og:site_name" content={siteSettings.name} />
    </>
  )}
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
