import { redirect } from 'next/navigation';
import axios from 'axios';

export async function GET(request, { params }) {
  const { practice_id, rating, appointment_uuid, rating_source } = params;
  
  try {
    // Fetch practice details to check for custom_rating_url
    const response = await axios.get(
      `https://passport.nevadacloud.com/api/v1/public/practices/${practice_id}`
    );
    
    const practice = response.data;
    
    // Check if custom_rating_url exists and is not empty
    if (practice.custom_rating_url && practice.custom_rating_url.trim() !== '') {
      // Redirect to the custom URL if it exists
      return redirect(practice.custom_rating_url, 'replace');
    }
    
    // Fallback to the default URL if no custom URL is provided
    const defaultUrl = `https://www.eyecareportal.com/practice_review/${practice_id}/${rating}/${appointment_uuid}/${rating_source}`;
    return redirect(defaultUrl, 'replace');
    
  } catch (error) {
    console.error('Error fetching practice details:', error);
    
    // Fallback to the default URL in case of any errors
    const defaultUrl = `https://www.eyecareportal.com/practice_review/${practice_id}/${rating}/${appointment_uuid}/${rating_source}`;
    return redirect(defaultUrl, 'replace');
  }
}
