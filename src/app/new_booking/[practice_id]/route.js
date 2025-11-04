import { redirect } from 'next/navigation';

export async function GET(request, { params }) {
  const { practice_id } = params;
  
  // Construct the external URL with the provided practice_id
  const externalUrl = `https://www.eyecareportal.com/new_booking/${practice_id}`;
  
  // Redirect to the external URL
  return redirect(externalUrl, 'replace');
}
