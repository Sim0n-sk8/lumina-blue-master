"use client";

import localFont from "next/font/local";
import "./globals.css";
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import MetadataServer from './MetadataServer';

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

export default function RootLayout({ children, params }) {
  return (
    <html lang="en">
      <head>
        {/* Server-rendered metadata */}
        <MetadataServer practiceID={params.practiceID} />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen w-full`}>
        <SiteSettingsProvider initialPracticeId={params.practiceID}>
          <main className="flex-grow w-full">{children}</main>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
