// app/[practiceID]/MetadataServer.js
import { getSiteSettings } from "@/lib/api";

export default async function MetadataServer({ practiceID }) {
  const siteSettings = await getSiteSettings(practiceID);
  const banner = siteSettings?.banners?.[0];

  const title = siteSettings?.name || "Lumina Blue";
  const description = banner?.banner_text || "";
  const ogImage = banner?.bannerImg || "https://lumina-blue-master.vercel.app/default-og.png";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:url" content={`https://lumina-blue-master.vercel.app/${practiceID}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
    </>
  );
}
