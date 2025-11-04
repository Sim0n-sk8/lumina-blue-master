export default async function PracticeWebsiteRedirect({ params }) {
  // Add 'use client' directive at the top of the file
  'use client';
  
  console.log('=== Starting Practice Website Redirect ===');
  console.log('Initial params:', params);
  
  // Destructure params after awaiting them
  const { practice_id, mail_uuid } = await Promise.resolve(params);
  
  console.log('Processing request for practice_id:', practice_id, 'mail_uuid:', mail_uuid);
  
  if (!practice_id) {
    console.error('Error: Missing practice_id parameter');
    const { redirect } = await import('next/navigation');
    return redirect('/error?message=Missing practice ID');
  }

  try {
    const apiUrl = `https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`;
    console.log('Fetching practice data from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    console.log('API Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }
    
    const practiceData = await response.json();
    console.log('=== Practice Data from API ===');
    console.log(JSON.stringify(practiceData, null, 2));
    console.log('==============================');
    
    // Get the website URL from the practice data
    let websiteUrl = practiceData.website;
    console.log('Original website URL from API:', websiteUrl);
    
    // If no website URL, use a default one
    if (!websiteUrl) {
      console.log('No website URL found in practice data, using fallback URL');
      websiteUrl = `https://www.eyecareportal.com/practice/${practice_id}`;
    }
    
    // Ensure the URL has a protocol
    if (websiteUrl && !websiteUrl.match(/^https?:\/\//)) {
      console.log('Adding https:// to URL');
      websiteUrl = `https://${websiteUrl}`;
    }
    
    console.log('Final website URL:', websiteUrl);
    
    // For external URLs, we need to use a client-side redirect
    console.log('=== Rendering client-side redirect ===');
    return (
      <html>
        <head>
          <meta httpEquiv="refresh" content={`0;url=${websiteUrl}`} />
          <script dangerouslySetInnerHTML={{
            __html: `window.location.href = "${websiteUrl}"`
          }} />
        </head>
        <body>
          <p>Redirecting to {websiteUrl}...</p>
          <p>If you are not redirected, <a href={websiteUrl}>click here</a>.</p>
        </body>
      </html>
    );
    
  } catch (error) {
    console.error('=== Error in practice website redirection ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    const fallbackUrl = `https://www.eyecareportal.com/practice/${practice_id}`;
    console.error('Falling back to URL:', fallbackUrl);
    
    return (
      <html>
        <head>
          <meta httpEquiv="refresh" content={`0;url=${fallbackUrl}`} />
          <script dangerouslySetInnerHTML={{
            __html: `window.location.href = "${fallbackUrl}"`
          }} />
        </head>
        <body>
          <p>Redirecting to {fallbackUrl}...</p>
          <p>If you are not redirected, <a href={fallbackUrl}>click here</a>.</p>
        </body>
      </html>
    );
  }
}
