import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const imageUrl = url.searchParams.get('url');
  
  if (!imageUrl) {
    return new Response('Missing image URL parameter', { status: 400 });
  }
  
  try {
    // Fetch the image from Instagram with proper headers
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return new Response('Failed to fetch image', { status: response.status });
    }
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Return the image with proper headers
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
    
  } catch (error) {
    console.error('Error proxying Instagram image:', error);
    return new Response('Internal server error', { status: 500 });
  }
};