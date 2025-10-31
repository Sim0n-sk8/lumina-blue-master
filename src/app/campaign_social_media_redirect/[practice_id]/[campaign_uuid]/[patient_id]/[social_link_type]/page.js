import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CampaignSocialMediaRedirect({ params }) {
  const { practice_id, campaign_uuid, patient_id, social_link_type } = params;
  
  // Construct the full external URL with the same path
  const externalUrl = `https://www.eyecareportal.com/campaign_social_media_redirect/${practice_id}/${campaign_uuid}/${patient_id}/${social_link_type}`;
  
  // Redirect to the external URL
  redirect(externalUrl);

  // This won't be rendered as we're redirecting
  return null;
}
