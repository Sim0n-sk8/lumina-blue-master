"use client";

import { use, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';
import Navbar from '../../pages/Navbar';
import FooterPage from '../../pages/FooterPage';

export default function BlogLayout({ children, params }) {
  const resolvedParams = use(params);
  const pathname = usePathname();
  
  // Extract customer code from URL if present
  const pathSegments = pathname ? pathname.split('/').filter(Boolean) : [];
  const isCustomerCodeRoute = pathSegments[0] && !/^\d+$/.test(pathSegments[0]);
  const customerCode = isCustomerCodeRoute ? pathSegments[0] : null;
  
  return (
    <SiteSettingsProvider 
      initialPracticeId={resolvedParams.practiceId}
      customerCode={customerCode}
    >
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <FooterPage />
      </div>
    </SiteSettingsProvider>
  );
}
