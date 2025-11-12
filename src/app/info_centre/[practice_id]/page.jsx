"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';
import InfoCentreHomePage from '../../pages/InfoCentreHomePage';
import { isLuminaPractice, getPracticeSettings, getPracticeLogo } from '../../../utils/practiceUtils';
import FooterPage from '../../pages/FooterPage';
import Navbar from '../../pages/Navbar';
import SinglePageNavbar from '../../components/SinglePageNavbar';

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
  const [practiceLogo, setPracticeLogo] = useState(null);
  const [hasLuminaSite, setHasLuminaSite] = useState(false);
  const [isLumina, setIsLumina] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get the actual practice ID (either directly or from the code)
  const practiceId = isCode ? null : identifier;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if this practice has a Lumina Blue site
        if (practiceId) {
          try {
            const response = await fetch(`https://www.eyecareportal.com/api/website/${practiceId}/0`);
            if (response.ok) {
              const data = await response.json();
              // If the response has data, it means this practice has a Lumina Blue site
              setHasLuminaSite(data && Object.keys(data).length > 0);
            }
          } catch (error) {
            console.error('Error checking Lumina site status:', error);
            setHasLuminaSite(false);
          }
        }

        // Check if this is a Lumina practice and get logo if not
        const luminaCheck = await isLuminaPractice(practiceId || identifier);
        setIsLumina(luminaCheck);

        if (!luminaCheck && practiceId) {
          try {
            const settings = await getPracticeSettings(practiceId);
            const logoUrl = getPracticeLogo(settings);
            if (logoUrl) {
              setPracticeLogo(logoUrl);
            }
          } catch (error) {
            console.error('Error fetching practice settings:', error);
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [practiceId, identifier]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteSettingsProvider
        initialPracticeId={practiceId}
        customerCode={isCode ? identifier : null}
      >
        {hasLuminaSite ? (
          <Navbar practiceLogo={practiceLogo} practiceId={practiceId} />
        ) : (
          <SinglePageNavbar practiceLogo={practiceLogo} practiceId={practiceId} />
        )}
        <div className="flex-grow">
          <InfoCentreHomePage />
        </div>
        <FooterPage />
      </SiteSettingsProvider>
    </div>
  );
}
