// lib/getSiteSettings.js
export async function getSiteSettings(customerCodeOrPracticeId) {
  let practiceId = customerCodeOrPracticeId;

  // If you have a customer code, fetch the practice ID first
  if (isNaN(Number(practiceId))) {
    try {
      const lookupRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/practice/by-code/${practiceId}`);
      if (!lookupRes.ok) return null;
      const data = await lookupRes.json();
      practiceId = data?.id;
    } catch {
      return null;
    }
  }

  if (!practiceId) return null;

  const apiKey = getDailyKey(); // replicate your client daily key logic
  const headers = { Authorization: `Bearer ${apiKey}` };

  try {
    const [siteSettings] = await Promise.all([
      fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`),
    ]);

    const [siteSettings2] = await Promise.all([
      fetch(`https://www.eyecareportal.com/api/website/${practiceId}/0`, { headers }),
    ]);

    if (!siteSettings.ok || !siteSettings2.ok) return null;

    const [practiceData] = await Promise.all([siteSettings.json()]);

    const [websiteData] = await Promise.all([siteSettings2.json()]);

    // Build the minimal settings for meta tags
    const practiceName = practiceData?.name || websiteData?.practice_name || "Lumina Blue";
    const shortName = practiceData?.short_name || websiteData?.practice_name || "Lumina Blue";
    const aboutText = websiteData?.about?.body || "";
   
    const bannerImage = websiteData?.banners[0].img || [];

    return {
      practiceName,
      shortName,
      aboutText,
      bannerImage,
    };
  } catch (err) {
    console.error("Error fetching server-side site settings:", err);
    return null;
  }
}

// replicate your daily key function
import crypto from "crypto";
function getDailyKey() {
  const today = new Date().toISOString().split("T")[0];
  return crypto.createHash("md5").update(today).digest("hex");
}
