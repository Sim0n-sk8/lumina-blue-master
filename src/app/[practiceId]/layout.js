import { getSiteSettings } from "../../lib/getSiteSettings";

export default async function CustomerLayout({ children, params }) {
  // Fetch all settings server-side
  const siteSettings = await getSiteSettings(params.practiceId);

  const siteName = siteSettings?.name || "Lumina Blue";
  const description =
    siteSettings?.aboutText || `${siteName} - Eye care services in ${siteSettings?.city || "your area"}`;
  const ogImageRaw =
  siteSettings?.banners?.length > 0
    ? siteSettings.banners[0].img
    : "/default-banner.jpg";

  const ogImage = ogImageRaw
    ? ogImageRaw
    : `default-placeholder.jpg`;

  return (
    <>
      <head>
        <title>{siteName}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={siteName} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
      
      
      </head>

      {children}
    </>
  );
}
