import { redirect } from 'next/navigation';

const EYECARE_PORTAL_BASE_URL = 'https://www.eyecareportal.com';

export default async function NewBookingRedirect({ params }) {
  const { practiceId } = await params;
  const targetUrl = `${EYECARE_PORTAL_BASE_URL}/${practiceId}/new_booking`;
  
  // Perform the redirect
  redirect(targetUrl);
  
  // This won't be rendered as we're redirecting
  return null;
}
