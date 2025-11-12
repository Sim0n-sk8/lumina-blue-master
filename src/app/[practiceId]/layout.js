import { getSiteSettings } from "../../lib/getSiteSettings";

export default async function CustomerLayout({ children, params }) {
  // Fetch all settings server-side
  const siteSettings = await getSiteSettings(params.practiceId);

  const siteName = siteSettings?.practiceName || "Lumina Blue";
  const description = siteSettings?.aboutText ;

  const ogImage = siteSettings?.bannerImage
  ? siteSettings.bannerImage
  : "/default-banner.jpg";

  return (
    <>
      <head>
        <title>{siteName}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={siteName} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1920" />
        <meta property="og:image:height" content="600" />
        <meta property="og:type" content="website" />


      </head>

      {children}
    </>
  );
}