import { NextResponse } from 'next/server';
import { getPracticeByCode } from '../../../../../lib/api-utils';


export async function GET(request, { params }) {
  // Get customerCode from params asynchronously
  const customerCode = await params.customerCode;

  // Validate customer code format
  if (!customerCode || typeof customerCode !== 'string' || customerCode.trim() === '') {
    return NextResponse.json(
      { error: 'Invalid customer code format' },
      { status: 400 }
    );
  }

  // Convert customer code to uppercase for case-insensitive matching
  const normalizedCustomerCode = customerCode.toUpperCase().trim();

  try {
    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/public/practice_by_customer_code?customer_code=${encodeURIComponent(normalizedCustomerCode)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Add a timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      // If practice not found, return 404
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Practice not found for customer code: ${customerCode}` },
          { status: 404 }
        );
      }
      
      // For other errors, forward the status code and error message
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.message || `Error fetching practice: ${response.statusText}`,
          details: errorData.details
        },
        { status: response.status }
      );
    }

    // Parse and return the practice data
    const practice = await response.json();
    
    // Ensure we have the required fields
    if (!practice.id || !practice.name) {
      console.error('Invalid practice data received from backend:', practice);
      return NextResponse.json(
        { error: 'Invalid practice data received from server' },
        { status: 500 }
      );
    }

    return NextResponse.json(practice);
    
  } catch (error) {
    console.error('Error fetching practice by code:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out while fetching practice data' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Prevent caching of this route
export const dynamic = 'force-dynamic';
