export async function getSiteSettings(customerCodeOrPracticeId) {
    if (!customerCodeOrPracticeId) return null;
    
    let practiceId = customerCodeOrPracticeId;
    let practiceData = null;
  
    // If it's a customer code (not a number), fetch the practice ID first
    if (isNaN(Number(customerCodeOrPracticeId))) {
      try {
        // First, get the practice ID from the customer code
        const lookupRes = await fetch(`https://passport.nevadacloud.com/api/v1/public/practice_by_customer_code?customer_code=${encodeURIComponent(customerCodeOrPracticeId)}`);
        
        if (!lookupRes.ok) {
          console.error('Failed to fetch practice by customer code:', lookupRes.status);
          return null;
        }
        
        const lookupData = await lookupRes.json();
        if (!lookupData || !lookupData.id) {
          console.error('No practice ID found for customer code:', customerCodeOrPracticeId);
          return null;
        }
        
        practiceId = lookupData.id;
        practiceData = lookupData; // Use the practice data we already have
      } catch (error) {
        console.error('Error looking up practice by customer code:', error);
        return null;
      }
    }
  
    if (!practiceId) return null;
    
    // If we already have the practice data from the lookup, we don't need to fetch it again
    if (practiceData) {
      const apiKey = getDailyKey();
      const headers = { Authorization: `Bearer ${apiKey}` };
      
      try {
        // Only fetch the website data since we already have the practice data
        const websiteRes = await fetch(`https://www.eyecareportal.com/api/website/${practiceId}/0`, { headers });
        if (!websiteRes.ok) return null;
        
        const websiteData = await websiteRes.json();
        
        // Build the settings with the practice data we already have
        const practiceName = practiceData?.name || websiteData?.practice_name || "Lumina Blue";
        const shortName = practiceData?.short_name || websiteData?.practice_name || "Lumina Blue";
        const aboutTextRaw = websiteData?.about?.body || "";
        const aboutText = aboutTextRaw.replace(/<[^>]*>/g, "").trim();
        const bannerImage = websiteData?.banners?.[0]?.img || "/default-banner.jpg";
        
        return {
          practiceId,
          practiceName,
          shortName,
          aboutText,
          bannerImage,
        };
      } catch (error) {
        console.error('Error fetching website data:', error);
        return null;
      }
    } else {
      // This is the case where we have a numeric practice ID
      const apiKey = getDailyKey();
      const headers = { Authorization: `Bearer ${apiKey}` };
  
      try {
        const [practiceRes, websiteRes] = await Promise.all([
          fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`),
          fetch(`https://www.eyecareportal.com/api/website/${practiceId}/0`, { headers }),
        ]);
    
        if (!practiceRes.ok || !websiteRes.ok) return null;
    
        const [practiceData, websiteData] = await Promise.all([
          practiceRes.json(),
          websiteRes.json(),
        ]);
    
        // Build the minimal settings for meta tags
        const practiceName = practiceData?.name || websiteData?.practice_name || "Lumina Blue";
        const shortName = practiceData?.short_name || websiteData?.practice_name || "Lumina Blue";
        const aboutTextRaw = websiteData?.about?.body || "";
        const aboutText = aboutTextRaw.replace(/<[^>]*>/g, "").trim();
        const bannerImage = websiteData?.banners?.[0]?.img || "/default-banner.jpg";
    
        return {
          practiceId,
          practiceName,
          shortName,
          aboutText,
          bannerImage,
        };
      } catch (error) {
        console.error('Error fetching practice data:', error);
        return null;
      }
    }
    }
  
  import crypto from "crypto";
  function getDailyKey() {
    const today = new Date().toISOString().split("T")[0];
    return crypto.createHash("md5").update(today).digest("hex");
  }