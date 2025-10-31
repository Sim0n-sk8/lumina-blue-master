'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SocialMediaRedirect({ params }) {
  const router = useRouter();
  const { practice_id, mail_uuid, social_link_type } = params;
  
  useEffect(() => {
    // Construct the target URL
    const targetUrl = `https://www.eyecareportal.com/social_media_redirect/${practice_id}/${mail_uuid}/${social_link_type}`;
    
    window.location.href = targetUrl;
  }, [practice_id, mail_uuid, social_link_type]);
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <p>Redirecting to social media...</p>
    </div>
  );
}
