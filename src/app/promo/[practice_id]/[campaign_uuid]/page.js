export default async function PromoRedirect({ params }) {
  // Destructure params after awaiting them
  const { practice_id, campaign_uuid } = await Promise.resolve(params);
  
  // Construct the target URL
  const targetUrl = `https://www.eyecareportal.com/promo/${practice_id}/${campaign_uuid}`;
  
  // Redirect using Next.js server-side redirect
  const { redirect } = await import('next/navigation');
  redirect(targetUrl);
  
  // This return won't be reached due to the redirect
  return null;
}
