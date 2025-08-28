import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const INSTAGRAM_APP_ID = import.meta.env.INSTAGRAM_APP_ID;
  const INSTAGRAM_APP_SECRET = import.meta.env.INSTAGRAM_APP_SECRET;
  const INSTAGRAM_REDIRECT_URI = import.meta.env.INSTAGRAM_REDIRECT_URI;

  if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET || !INSTAGRAM_REDIRECT_URI) {
    return new Response(
      JSON.stringify({ 
        error: 'Instagram credentials not configured',
        message: 'Please set INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, and INSTAGRAM_REDIRECT_URI'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Authorization failed',
        message: `Instagram returned error: ${error}`
      }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (!code) {
    return new Response(
      JSON.stringify({ 
        error: 'No authorization code received',
        message: 'Instagram did not return an authorization code'
      }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Intercambiar código por access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_REDIRECT_URI,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      return new Response(
        JSON.stringify({ 
          error: 'Token exchange failed',
          message: `Failed to exchange code for token: ${errorData}`
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;

    // Intercambiar short-lived token por long-lived token
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${shortLivedToken}`,
      { method: 'GET' }
    );

    if (!longLivedResponse.ok) {
      const errorData = await longLivedResponse.text();
      return new Response(
        JSON.stringify({ 
          error: 'Long-lived token exchange failed',
          message: `Failed to get long-lived token: ${errorData}`
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const longLivedData = await longLivedResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Authorization successful! Copy this access token to your .env file:',
        access_token: longLivedData.access_token,
        expires_in: longLivedData.expires_in,
        token_type: longLivedData.token_type,
        instructions: {
          step1: 'Copy the access_token value',
          step2: 'Add it to your .env file as INSTAGRAM_ACCESS_TOKEN=your_token_here',
          step3: 'Restart your development server',
          step4: 'Your Instagram API will now use real data'
        }
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected error',
        message: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};