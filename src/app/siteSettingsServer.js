import { cache } from 'react';
import crypto from 'crypto';

const getDailyKey = cache(() => {
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = crypto.createHash('md5').update(today).digest('hex');
  return dailyKey;
});

// Helper to parse working hours
function parseWorkingHours(hoursString) {
  if (!hoursString || typeof hoursString !== 'string') {
    return [];
  }

  const daysMap = {
    '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
    '4': 'Thursday', '5': 'Friday', '6': 'Saturday', '7': 'Sunday'
  };

  try {
    return hoursString
      .split(';')
      .filter(Boolean)
      .map(entry => {
        if (!entry) return null;
        const [days, start, end] = entry.split('-');
        if (!days) return null;

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

export const getSiteSettings = cache(async (initialPracticeId, customerCode) => {
  let practiceId = initialPracticeId;
  let isCustomerCode = !!customerCode;
  let settingsError = null;
  let isLoading = true;

  const apiKey = getDailyKey();
  const headers = {
    'Authorization': `Bearer ${apiKey}`
  };

  if (!practiceId && !customerCode) {
    isLoading = false;
    return {
      siteSettings: {}, // Return an empty or default object
      error: 'No practice ID or customer code provided',
      isLoading: false,
      practiceId: null,
      isCustomerCode: false,
      customerCode: null,
    };
  }

  try {
    let practiceDataFromCode = null;

    // If we have a customer code, look up the practice ID first
    if (customerCode) {
      try {
        const practiceLookupResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/practice/by-code/${customerCode}`, {
          // Cache busting for development, remove in production if not needed
          cache: 'no-store' 
        });
        if (!practiceLookupResponse.ok) {
          console.warn(`Practice not found for customer code: ${customerCode}, using default settings`);
          // Don't throw error, just indicate no data found
        } else {
          practiceDataFromCode = await practiceLookupResponse.json();
          if (practiceDataFromCode?.id) {
            practiceId = practiceDataFromCode.id;
          } else {
            console.warn('Invalid practice data received for customer code lookup');
          }
        }
      } catch (err) {
        console.error('Error fetching practice data by customer code:', err);
        settingsError = 'Failed to load practice information by customer code.';
      }
    }

    const effectivePracticeId = practiceId;

    if (!effectivePracticeId) {
      return {
        siteSettings: {},
        error: settingsError || 'No valid practice ID available after lookup.',
        isLoading: false,
        practiceId: null,
        isCustomerCode,
        customerCode,
      };
    }

    const [response1, response2, response3] = await Promise.all([
      fetch(`https://www.eyecareportal.com/api/website/${effectivePracticeId}/0`, { headers, cache: 'no-store' }).then(res => res.json()).catch(() => ({})),
      fetch(`https://www.ocumail.com/api/settings?setting_object_id=${effectivePracticeId}&setting_object_type=Practice`, { headers, cache: 'no-store' }).then(res => res.json()).catch(() => []),
      fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${effectivePracticeId}`, { cache: 'no-store' }).then(res => res.json()).catch(() => ({}))
    ]);

    const data = response1;
    const data2 = response2;
    const data3 = response3;

    const primaryColorSetting = Array.isArray(data2)
      ? data2.find(setting => setting?.setting_name === "PrimaryColor")
      : null;
    const primaryColor = primaryColorSetting?.setting_value || 'orange';

    const workingHours = data3?.hours ? parseWorkingHours(data3.hours) : [];

    const defaultSettings = {
      practiceId: effectivePracticeId,
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

    const siteSettings = {
      ...defaultSettings,
      counterSettings: {
        brands: Number(data.statstems?.find(s => s.label === "Number of Brands")?.value) || 0,
        frames: (data.featured_services?.length || 0) * 500, // Placeholder
        customers: (data.reviews?.length || 0) * 500, // Placeholder
        experience: Math.floor(Math.random() * 20) + 5
      },
      show_counters_panel: data.practice_website?.show_counters_panel ?? defaultSettings.show_counters_panel,
      show_custom_panel: data.practice_website?.show_custom_panel ?? defaultSettings.show_custom_panel,
      show_socials_panel: data.practice_website?.show_socials_panel ?? defaultSettings.show_socials_panel,
      show_teams_panel: data.practice_website?.show_teams_panel ?? defaultSettings.show_teams_panel,
      show_youtube_panel: data.practice_website?.show_youtube_panel ?? defaultSettings.show_youtube_panel,
      aboutText: data.about?.body || "",
      about: data.about || {},
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

    return {
      siteSettings,
      error: settingsError,
      isLoading: false,
      practiceId: effectivePracticeId,
      isCustomerCode,
      customerCode,
    };
  } catch (error) {
    console.error('Error fetching practice data in server component:', error);
    return {
      siteSettings: {},
      error: error.message,
      isLoading: false,
      practiceId: initialPracticeId,
      isCustomerCode,
      customerCode,
    };
  }
});