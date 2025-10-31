import { redirect } from 'next/navigation';
import axios from 'axios';

export async function GET(request, { params }) {
  const { practice_id, rating, appointment_uuid } = params;
  
  try {
    // Fetch practice details to check for custom_rating_url
    const response = await axios.get(`https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`);
    const practiceData = response.data;
    
    // If custom_rating_url exists and has a value, redirect to it
    if (practiceData?.custom_rating_url) {
      return redirect(practiceData.custom_rating_url, 'replace');
    }
  } catch (error) {
    console.error('Error fetching practice data:', error);
    // Continue to fallback URL if there's an error
  }
  
  // Fallback redirect if no custom_rating_url or if there was an error
  const fallbackUrl = `https://www.eyecareportal.com/practice_review/${practice_id}/${rating}/preview_only`;
  return redirect(fallbackUrl, 'replace');
}
