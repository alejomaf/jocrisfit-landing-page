import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, redirect }) => {
  const INSTAGRAM_APP_ID = import.meta.env.INSTAGRAM_APP_ID;
  const INSTAGRAM_REDIRECT_URI = import.meta.env.INSTAGRAM_REDIRECT_URI;

  if (!INSTAGRAM_APP_ID || !INSTAGRAM_REDIRECT_URI) {
    return new Response(
      JSON.stringify({ 
        error: 'Instagram credentials not configured',
        message: 'Please set INSTAGRAM_APP_ID and INSTAGRAM_REDIRECT_URI in your environment variables'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Construir URL de autorización de Instagram
  const authUrl = new URL('https://api.instagram.com/oauth/authorize');
  authUrl.searchParams.set('client_id', INSTAGRAM_APP_ID);
  authUrl.searchParams.set('redirect_uri', INSTAGRAM_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'user_profile,user_media');
  authUrl.searchParams.set('response_type', 'code');

  // Redirigir al usuario a Instagram para autorización
  return redirect(authUrl.toString());
};