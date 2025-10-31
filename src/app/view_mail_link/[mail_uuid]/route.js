import { redirect } from 'next/navigation';

export async function GET(request, { params }) {
  const { mail_uuid } = params;
  
  // Directly redirect to the external URL
  const externalUrl = `https://www.eyecareportal.com/view_mail_link/${mail_uuid}`;
  return redirect(externalUrl, 'replace');
}
