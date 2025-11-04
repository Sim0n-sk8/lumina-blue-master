import { redirect } from 'next/navigation';

export async function GET(request, { params }) {
  const { practice_id, mail_uuid } = params;
  
  // Construct the external URL with the provided parameters
  const externalUrl = `https://www.eyecareportal.com/contact_lens_order/${practice_id}/${mail_uuid}`;
  
  // Redirect to the external URL
  return redirect(externalUrl, 'replace');
}
