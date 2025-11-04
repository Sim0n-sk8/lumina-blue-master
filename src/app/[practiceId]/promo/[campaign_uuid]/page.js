import { redirect } from 'next/navigation';

const EYECARE_PORTAL_BASE_URL = 'https://www.eyecareportal.com';

export default async function PromoRedirect({ params }) {
  const { practiceId, campaign_uuid } = await params;
  const targetUrl = `${EYECARE_PORTAL_BASE_URL}/${practiceId}/promo/${campaign_uuid}`;
  
  // Perform the redirect
  redirect(targetUrl);
  
  // This won't be rendered as we're redirecting
  return null;
}
