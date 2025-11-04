import { NextResponse } from 'next/server';

export async function GET(request, context) {
  try {
    const { params } = context;
    const practice_id = params.practice_id;
    const appointment_uuid = params.appointment_uuid;

    if (!practice_id || !appointment_uuid) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Redirect to the main reschedule endpoint
    const redirectUrl = `/appointment_request_reschedule/${practice_id}/${appointment_uuid}`;
    
    // Return a simple HTML page with the redirect link
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting...</title>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <script>window.location.href = '${redirectUrl}';</script>
        </head>
        <body>
          <p>If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error in appointment reschedule link:', error);
    return new NextResponse('Error processing request', { status: 500 });
  }
}
