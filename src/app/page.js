"use client"

import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    const savedCustomerCode = typeof window !== 'undefined' ? localStorage.getItem('customerCode') : null;
    
    if (savedCustomerCode) {
      router.push(`/${savedCustomerCode}`);
    } else {
      // Redirect to clean info_centre by default
      router.push('/info_centre');
    }
  }, [router]);

  return null;
}