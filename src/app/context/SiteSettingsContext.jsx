"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import crypto from 'crypto';

// Define the shape of our context value
const SiteSettingsContext = createContext({
  siteSettings: null,
  error: null,
  isLoading: true,
  practiceId: null,
  isCustomerCode: false,
  customerCode: null
});

const getSettings = (practiceId) => ({
  practiceId,
  primaryColor: practiceId === '8' ? 'green' : 'orange',
  counterSettings: {
    brands: 0,
    frames: 0,
    customers: 0,
    experience: 0
  },
  show_counters_panel: true,
  show_custom_panel: true,
  show_socials_panel: true,
  show_teams_panel: true,
  show_youtube_panel: true,
  aboutText: "",
  about: {},
  member: {
    member: []
  },
  services: [],
  service_description: {},
  teamMembers: [],
  brands: [],
  banners: [],
  reviews: {
    review: []
  },
  statitems: [],
  name: "",
  address_1: "",
  working_hours: [],
  featured_services: [],
});

function getDailyKey() {
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = crypto.createHash('md5').update(today).digest('hex');
  return dailyKey;
}

export function SiteSettingsProvider({ children, initialPracticeId, customerCode }) {
  const [siteSettings, setSiteSettings] = useState(getSettings(initialPracticeId || ''));
  const [practiceId, setPracticeId] = useState(initialPracticeId);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomerCode, setIsCustomerCode] = useState(!!customerCode);

  useEffect(() => {
    let isMounted = true;

    async function fetchPracticeData() {
      const apiKey = getDailyKey();
      const headers = {
        'Authorization': `Bearer ${apiKey}`
      };

      if (!practiceId && !customerCode) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let practiceData;
        
        // If we have a customer code, look up the practice ID first
        if (customerCode) {
          try {
            const practiceLookupResponse = await fetch(`/api/practice/by-code/${customerCode}`);
            if (!practiceLookupResponse.ok) {
              console.warn(`Practice not found for customer code: ${customerCode}, using default settings`);
              // Don't throw error, just use default settings
              if (isMounted) {
                setSiteSettings(getSettings(''));
                setIsLoading(false);
              }
              return;
            }
            practiceData = await practiceLookupResponse.json();
            if (practiceData?.id) {
              setPracticeId(practiceData.id);
            } else {
              throw new Error('Invalid practice data received');
            }
          } catch (err) {
            console.error('Error fetching practice data:', err);
            if (isMounted) {
              setError('Failed to load practice information. Using default settings.');
              setSiteSettings(getSettings(''));
              setIsLoading(false);
            }
            return;
          }
        }

        const effectivePracticeId = practiceData?.id || practiceId;
        const practiceResponse = await fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${effectivePracticeId}`);
        const response = await fetch(`https://www.eyecareportal.com/api/website/${effectivePracticeId}/0`, { headers });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch practice data: ${response.status}`);
        }

        const response2 = await fetch(`https://www.ocumail.com/api/settings?setting_object_id=${effectivePracticeId}&setting_object_type=Practice`, { headers });

        if (!response2.ok) {
          const errorData2 = await response2.json();
          throw new Error(errorData2.error || `Failed to fetch practice data: ${response2.status}`);
        }

        const [data, data2, data3] = await Promise.all([
          response.json().catch(() => ({})),
          response2.json().catch(() => []),
          practiceResponse.json().catch(() => ({}))
        ]);

        // Safely get primary color with fallback
        const primaryColorSetting = Array.isArray(data2) 
          ? data2.find(setting => setting?.setting_name === "PrimaryColor")
          : null;
        const primaryColor = primaryColorSetting?.setting_value || 'orange';

        // Safely get address object
        const addressObject = Array.isArray(data2)
          ? data2.find(obj => obj?.setting_name === "Address1")
          : null;

        document.documentElement.style.setProperty('--primary-color', primaryColor);

        function parseWorkingHours(hoursString) {
          // Return empty array if input is invalid
          if (!hoursString || typeof hoursString !== 'string') {
            return [];
          }
          
          const daysMap = {
            '0': 'Sunday',
            '1': 'Monday',
            '2': 'Tuesday',
            '3': 'Wednesday',
            '4': 'Thursday',
            '5': 'Friday',
            '6': 'Saturday',
            '7': 'Sunday'
          };

          try {
            return hoursString
              .split(';')
              .filter(Boolean) // Remove empty entries
              .map(entry => {
                if (!entry) return null;
                
                const [days, start, end] = entry.split('-');
                
                // Skip if days are not defined
                if (!days) return null;
                
                // Safely process day names
                const dayNames = days
                  .split('|')
                  .map(day => daysMap[day] || day)
                  .filter(Boolean)
                  .join(', ');
                  
                return {
                  days: dayNames || 'Unknown',
                  start: start || 'Closed',
                  end: end || '',
                  open: start && start !== 'Closed' && start !== 'closed'
                };
              })
              .filter(Boolean);
          } catch (error) {
            console.error('Error parsing working hours:', error);
            return [];
          }
        }

        // Safely handle missing or invalid data
        const workingHours = data3?.hours ? parseWorkingHours(data3.hours) : [];
        
        // Default settings object with all required properties
        const defaultSettings = {
          practiceId: practiceId || '',
          primaryColor: primaryColor || '#2196f3',
          working_hours: workingHours,
          counterSettings: {
            brands: 0,
            frames: 0,
            customers: 0,
            experience: 0
          },
          show_counters_panel: true,
          show_custom_panel: true,
          show_socials_panel: true,
          show_teams_panel: true,
          show_youtube_panel: true,
          aboutText: '',
          about: {},
          member: { member: [] },
          services: [],
          service_description: {},
          brands: [],
          banners: [],
          reviews: { review: [] },
          statitems: [],
          name: '',
          address_1: '',
          featured_services: []
        };

        const settings = {
          ...defaultSettings,
          counterSettings: {
            brands: Number(data.statstems?.find(s => s.label === "Number of Brands")?.value) || 0,
            frames: (data.featured_services?.length || 0) * 500,
            customers: (data.reviews?.length || 0) * 500,
            experience: Math.floor(Math.random() * 20) + 5
          },
          show_counters_panel: data.practice_website?.show_counters_panel,
          show_custom_panel: data.practice_website?.show_custom_panel,
          show_socials_panel: data.practice_website?.show_socials_panel,
          show_teams_panel: data.practice_website?.show_teams_panel,
          show_youtube_panel: data.practice_website?.show_youtube_panel,
          aboutText: data.about?.body || "",
          about: data.about,
          team: data.team || [],
          teamMembers: Array.isArray(data.team) ? data.team.map(member => ({
            id: member.id,
            name: member.name || "Team Member",
            qualification: member.qualification || "Eye Care Professional",
            img: member.img || "/images/default-avatar.jpg"
          })) : [],
          services: data.services?.map(service => ({
            id: service.id,
            title: service.service_title,
            description: service.long_description,
            iconDescription: service.icon_desc,
            icon_id: service.icon_id,
            image_name: service.image_name
          })) || [],
          banners: data.banners?.map(banner => ({
            id: banner.id,
            title: banner.banner_title,
            titleFontSize: banner.banner_title_font_size,
            text: banner.banner_text,
            textFontSize: banner.banner_text_font_size,
            titleGoogleFont: banner.banner_title_google_font,
            textGoogleFont: banner.banner_text_google_font,
            bannerImg: banner.img,
            // {bannerimg}
            buttonText: banner.button_text,
            buttonLink: banner.button_link
          })) || [],
          service_description: data.service_description || {},
          brands: data.brands?.map(brand => ({
            id: brand.id,
            name: brand.name,
            img: brand.img,
            brand_url: brand.brand_url,
            order_number: brand.order_number,
            show: brand.show
          })) || [],
          reviews: {
            review: data.reviews || []
          },
          member: {
            member: data.member || []
          },
          statitems: data.statitems || [],
          name: data3?.name || '',
          short_name: data3?.short_name || '',
          address_1: data3?.address_1 || '',
          address_2: data3?.address_2 || '',
          city: data3?.city || '',
          state: data3?.state || '',
          zip: data3?.zip || '',
          tel: data3?.tel || '',
          fax: data3?.fax || '',
          email: data3?.email || '',
          facebook_url: data3?.facebook_url || '',
          instagram_url: data3?.instagram_url || '',
          linkedin_url: data3?.linkedin_url || '',
          pinterest_url: data3?.pinterest_url || '',
          whatsapp_tel: data3?.whatsapp_tel || '',
          tiktok_url: data3?.tiktok_url || '',
          google_business_profile_url: data3?.google_business_profile_url || '',
          hours: data3?.hours || '',
          featured_services: data.featured_services && data.featured_services.length > 0 
            ? data.featured_services 
            : data.services?.map(service => ({
                id: service.id,
                service_title: service.service_title || service.title,
                long_description: service.long_description || service.description,
                icon_desc: service.icon_desc,
                icon_id: service.icon_id,
                image_name: service.image_name
              })) || [],
        };

        setSiteSettings(settings);
        setError(null);
      } catch (error) {
        console.error('Error fetching practice data:', error);
        if (isMounted) {
          setError(error.message);
          setSiteSettings(prev => ({
            ...prev,
            practiceId,
            primaryColor: practiceId === '8' ? 'green' : 'orange'
          }));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPracticeData();

    return () => {
      isMounted = false;
    };
  }, [practiceId, customerCode]);

  useEffect(() => {
    // This effect intentionally left empty
  }, [siteSettings, customerCode]);

  // Ensure all required values are provided
  const contextValue = {
    siteSettings,
    error,
    isLoading,
    practiceId: practiceId || null,
    isCustomerCode: isCustomerCode || false,
    customerCode: customerCode || null
  };

  return (
    <SiteSettingsContext.Provider value={contextValue}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}