import { redirect } from 'next/navigation';

export async function GET(request, { params }) {
  const { practice_id, rating, appointment_uuid } = params;
  
  // Construct the external URL with the provided parameters
  const externalUrl = `https://www.eyecareportal.com/practice_review/${practice_id}/${rating}/${appointment_uuid}`;
  
  // Redirect to the external URL
  return redirect(externalUrl, 'replace');
}
