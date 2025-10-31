import { redirect } from 'next/navigation';

export default function CampaignBookingRequest({ params }) {
  const { practice_id, campaign_uuid, patient_id } = params;
  
  // Construct the full external URL with the same path
  const externalUrl = `https://www.eyecareportal.com/campaign_booking_request/${practice_id}/${campaign_uuid}/${patient_id}`;
  
  // Redirect to the external URL
  redirect(externalUrl);

  // This won't be rendered as we're redirecting
  return null;
}
