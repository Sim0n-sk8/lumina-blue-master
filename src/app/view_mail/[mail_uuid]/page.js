import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ViewMailRedirect({ params }) {
  const { mail_uuid } = await Promise.resolve(params);
  
  const externalUrl = `https://www.eyecareportal.com/view_mail/${mail_uuid}`;
  
  redirect(externalUrl);
}