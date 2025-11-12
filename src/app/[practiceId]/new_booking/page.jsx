"use client";

import { useParams } from 'next/navigation';
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';

// Function to check if the identifier is a customer code
function isCustomerCode(identifier) {
  // Check if it's in the format -DEMO- (starts and ends with a dash)
  if (/^-.+-$/.test(identifier)) return true;
  
  // Check if it's alphanumeric (letters and numbers only, no spaces or special chars)
  if (/^[a-zA-Z0-9]+$/.test(identifier)) {
    // All digits = More likely practice ID
    if (/^\d+$/.test(identifier)) return false;
    // Otherwise, treat it as a customer code
    return true;
  }
  
  return false;
}

export default function BookingPage() {
  const { practiceId: identifier } = useParams();
  const isCode = isCustomerCode(identifier);

  if (!identifier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Identifier</h2>
          <p className="text-gray-600">Please provide a valid practice identifier or customer code</p>
        </div>
      </div>
    );
  }

  return (
    <SiteSettingsProvider 
      initialPracticeId={isCode ? null : identifier}
      customerCode={isCode ? identifier : null}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isCode ? 'Customer Code' : 'Practice ID'}: {identifier}
          </h2>
          <p className="text-gray-700 mb-4">
            Welcome to our booking system. This is a placeholder page for {isCode ? 'customer code' : 'practice ID'}: {identifier}.
          </p>
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <p className="text-gray-600">Booking form and availability calendar will be implemented here.</p>
          </div>
        </div>
      </div>
    </SiteSettingsProvider>
  );
}