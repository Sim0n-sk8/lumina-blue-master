"use client";

import { useParams } from 'next/navigation';
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';
import InfoCentreHomePage from '../../pages/InfoCentreHomePage';
import FooterPage from '../../pages/FooterPage';

// Function to check if the identifier is a customer code
function isCustomerCode(identifier) {
  // Check if it's in the format -DEMO- (starts and ends with a dash)
  if (/^-.+-$/.test(identifier)) return true;
  
  // Check if it's alphanumeric (letters and numbers only, no spaces or special chars)
  if (/^[a-zA-Z0-9]+$/.test(identifier)) {
    // If it's all digits, it's more likely a practice ID
    if (/^\d+$/.test(identifier)) return false;
    // Otherwise, treat it as a customer code
    return true;
  }
  
  return false;
}

export default function InfoCentrePage() {
  const { practice_id: identifier } = useParams();
  const isCode = isCustomerCode(identifier);

  if (!identifier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Practice ID Required</h2>
          <p className="text-gray-600">Please provide a valid practice identifier</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteSettingsProvider
        initialPracticeId={isCode ? null : identifier}
        customerCode={isCode ? identifier : null}
      >
        <div className="flex-grow">
          <InfoCentreHomePage />
        </div>
        <FooterPage />
      </SiteSettingsProvider>
    </div>
  );
}
