// app/[practiceID]/head.js
import { getSiteSettings } from "@/lib/api";

export default async function Head({ params }) {
  const { practiceID } = params;

  // fetch banners for this practice
  const siteSettings = await getSiteSettings(practiceID);

  // pick first banner or filter by display_order
  const banner = siteSettings?.banners?.[0];

  const title = siteSettings?.name || "Lumina Blue";
  const description = banner?.banner_text || "";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:url" content={`https://lumina-blue-master.vercel.app/${practiceID}`} />
      <meta property="og:title" content="this is a test" />
      <meta property="og:description" content={description} />
      {banner?.bannerImg && <meta property="og:image" content={banner.bannerImg} />}
    </>
  );
}
