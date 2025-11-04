import { getSiteSettings } from "../../lib/getSiteSettings";

export default async function CustomerLayout({ children, params }) {
  // Fetch all settings server-side
  const siteSettings = await getSiteSettings(params.practiceId);

  const siteName = siteSettings?.name || "Lumina Blue";
  const description =
    siteSettings?.aboutText || `${siteName} - Eye care services in ${siteSettings?.city || "your area"}`;
  const ogImageRaw = siteSettings?.banners?.[0]?.bannerImg || "/default-banner.jpg";
  const ogImage = ogImageRaw.startsWith("http")
    ? ogImageRaw
    : `https://s3.eu-west-2.amazonaws.com/luminablue-blogs/${ogImageRaw}`;

  return (
    <>
      <head>
        <title>{siteName}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={siteName} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        {siteSettings?.address_1 && <meta property="og:street-address" content={siteSettings.address_1} />}
        {siteSettings?.city && <meta property="og:locality" content={siteSettings.city} />}
        {siteSettings?.state && <meta property="og:region" content={siteSettings.state} />}
        {siteSettings?.zip && <meta property="og:postal-code" content={siteSettings.zip} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </head>

      {children}
    </>
  );
}
