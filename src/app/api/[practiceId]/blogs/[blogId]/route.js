import { NextResponse } from 'next/server';

// Known customer code to practice ID mappings
const CUSTOMER_CODE_MAP = {
  'E007': '71',
  'DEMO': '67',
  'R003': '173',
  'D020': '741'
};

export async function GET(request, { params }) {
  try {
    const { practiceId, blogId } = await Promise.resolve(params);
    
    // If no practiceId or blogId provided, return 404
    if (!practiceId || !blogId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    
    // Check if practiceId is a number (traditional ID) or a string (customer code)
    const isNumericId = /^\d+$/.test(practiceId);
    let effectivePracticeId = practiceId;
    
    // Handle customer code lookup if not a numeric ID
    if (!isNumericId) {
      const cleanCode = practiceId.replace(/^-+|-+$/g, '').toUpperCase();
      
      // First check our known mappings
      if (CUSTOMER_CODE_MAP[cleanCode]) {
        effectivePracticeId = CUSTOMER_CODE_MAP[cleanCode];
      } else {
        // Fallback to API lookup for unknown codes
        try {
          const practiceResponse = await fetch(`https://www.eyecareportal.com/api/practices?customer_code=${cleanCode}`);
          if (practiceResponse.ok) {
            const practiceData = await practiceResponse.json();
            if (practiceData && practiceData.length > 0) {
              effectivePracticeId = practiceData[0].id;
            }
          }
        } catch (error) {
          console.error(`[Blog Detail] Error looking up practice for code ${cleanCode}:`, error);
        }
      }
    }

    // Helper function to fetch a blog post with error handling and proper caching
    const fetchBlogPost = async (url, isPracticeSpecific = false) => {
      try {
        const response = await fetch(url, {
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          },
          next: { revalidate: 60 } // Revalidate every 60 seconds
        });
        
        if (!response.ok) {
          return { success: false, error: `HTTP ${response.status}` };
        }
        
        const data = await response.json();
        
        // Ensure we have valid blog data
        if (!data || (isPracticeSpecific && !data.practice_id)) {
          return { success: false, error: 'Invalid blog data' };
        }
        
        return { success: true, data };
      } catch (error) {
        console.error(`[Blog Detail] Error fetching ${isPracticeSpecific ? 'practice-specific' : 'global'} blog from ${url}:`, error);
        return { success: false, error: error.message };
      }
    };

    let blog = null;
    
    // First, try to fetch practice-specific blog if we have a valid practice ID
    if (effectivePracticeId && effectivePracticeId !== practiceId) {
      const practiceBlogUrl = `https://www.eyecareportal.com/api/blogs/${blogId}?practice_id=${effectivePracticeId}`;
      
      const practiceResponse = await fetchBlogPost(practiceBlogUrl, true);
      
      if (practiceResponse.success && practiceResponse.data) {
        blog = practiceResponse.data;
      }
    }
    
    // If no practice-specific blog found, try global
    if (!blog) {
      const globalBlogUrl = `https://www.eyecareportal.com/api/blogs/${blogId}`;
      
      const globalResponse = await fetchBlogPost(globalBlogUrl, false);
      
      if (globalResponse.success && globalResponse.data) {
        blog = globalResponse.data;
      } else {
        return NextResponse.json(
          { 
            error: 'Blog post not found',
            message: 'The requested blog post could not be found.',
            status: 404
          },
          { 
            status: 404,
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60'
            }
          }
        );
      }
    }
    
    // If we get here, we have a valid blog post
    const responseData = {
      ...blog,
      // Ensure these fields always exist to prevent hydration mismatches
      title: blog.title || 'Untitled Blog Post',
      content: blog.content || '',
      date: blog.date || new Date().toISOString().split('T')[0],
      show: blog.show !== false // Default to true if not set
    };

    // Return the blog post with proper caching and content type headers
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Vary': 'Accept-Encoding'
      }
    });
  } catch (error) {
    console.error('[Blog Detail API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function fetchFromAllBlogs(practiceId, blogId) {
  try {
    // Fallback: Fetch all blogs and filter
    const response = await fetch('https://www.eyecareportal.com/api/blogs', {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Blog Detail API] Error fetching all blogs:', error);
      throw new Error('Failed to fetch blogs');
    }

    const blogs = await response.json();
    
    if (!Array.isArray(blogs)) {
      console.error('[Blog Detail API] Expected array of blogs but got:', typeof blogs);
      throw new Error('Invalid data format received from API');
    }

    // Find the specific blog by ID and practice ID
    const blog = blogs.find(b => 
      b && 
      b.id && 
      b.id.toString() === blogId && 
      (b.practice_id === null || b.practice_id.toString() === practiceId) &&
      b.show === true
    );

    if (!blog) {
      console.warn(`[Blog Detail API] Blog not found with ID: ${blogId} for practice: ${practiceId}`);
      return NextResponse.json(
        { error: 'Blog post not found or not available for this practice' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('[Blog Detail API] Error in fallback:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch blog post',
        details: error.details 
      },
      { status: error.status || 500 }
    );
  }
}
