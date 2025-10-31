export default async function PracticeWebsiteRedirect({ params }) {
  // Destructure params after awaiting them
  const { practice_id, mail_uuid } = await Promise.resolve(params);
  
  // Construct the target URL
  const targetUrl = `http://www.eyecareportal.com/practice_website_redirect/${practice_id}/${mail_uuid}`;
  
  // Redirect using Next.js server-side redirect
  const { redirect } = await import('next/navigation');
  redirect(targetUrl);
  
  // This return won't be reached due to the redirect
  return null;
}
