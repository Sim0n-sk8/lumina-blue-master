// app/[practiceID]/head.js
import { getSiteSettings } from "@/lib/api";

export default async function Head({ params }) {
  const { practiceID } = params;
  const siteSettings = await getSiteSettings(practiceID);
  const banner = siteSettings?.banners?.[0];

  return (
    <>
      <title>{siteSettings?.name || 'Lumina Blue'}</title>
      <meta name="description" content={banner?.banner_text || ''} />
      <meta property="og:url" content={`https://lumina-blue-master.vercel.app/${practiceID}`} />
      <meta property="og:title" content={siteSettings?.name || 'Lumina Blue'} />
      <meta property="og:description" content={banner?.banner_text || ''} />
      {banner?.bannerImg && <meta property="og:image" content={banner.bannerImg} />}
    </>
  );
}
