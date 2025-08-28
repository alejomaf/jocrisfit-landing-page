import type { APIRoute } from 'astro';

interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: string;
  comments: string;
  caption?: string;
  timestamp?: string;
}

interface CacheEntry {
  data: InstagramPost[];
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();
const CACHE_KEY = 'instagram_posts';
const CACHE_DURATION = parseInt(import.meta.env.INSTAGRAM_CACHE_DURATION || '30') * 60 * 1000;

// Instagram API configuration
const INSTAGRAM_ACCESS_TOKEN = import.meta.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_ENABLED = import.meta.env.INSTAGRAM_ENABLED !== 'false';

// Función para obtener posts del usuario usando Instagram Basic Display API
async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    console.warn('Instagram access token not configured, using fallback data');
    return getFallbackPosts();
  }

  try {
    // Obtener posts del usuario
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,like_count,comments_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      console.error('Instagram API error:', response.status, response.statusText);
      return getFallbackPosts();
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid Instagram API response format');
      return getFallbackPosts();
    }

    // Filtrar solo imágenes y videos, convertir a nuestro formato
    const posts: InstagramPost[] = data.data
      .filter((item: any) => item.media_type === 'IMAGE' || item.media_type === 'VIDEO')
      .slice(0, 6) // Limitar a 6 posts
      .map((item: any) => ({
        id: item.id,
        imageUrl: item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url,
        likes: item.like_count?.toString() || '0',
        comments: item.comments_count?.toString() || '0',
        caption: item.caption || '',
        timestamp: item.timestamp || ''
      }));

    return posts;
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return getFallbackPosts();
  }
}

// Función para generar datos de fallback cuando la API no está disponible
function getFallbackPosts(): InstagramPost[] {
  const fallbackPosts: InstagramPost[] = [
    {
      id: 'fallback_1',
      imageUrl: 'https://picsum.photos/400/400?random=1',
      likes: '127',
      comments: '23',
      caption: 'Entrenamiento de fuerza - Transformación en progreso 💪',
      timestamp: new Date().toISOString()
    },
    {
      id: 'fallback_2', 
      imageUrl: 'https://picsum.photos/400/400?random=2',
      likes: '89',
      comments: '15',
      caption: 'Rutina de cardio matutina ☀️',
      timestamp: new Date().toISOString()
    },
    {
      id: 'fallback_3',
      imageUrl: 'https://picsum.photos/400/400?random=3', 
      likes: '156',
      comments: '31',
      caption: 'Alimentación saludable es clave 🥗',
      timestamp: new Date().toISOString()
    }
  ];

  return fallbackPosts;
}

// Función para verificar si el cache es válido
function isCacheValid(cacheEntry: CacheEntry | undefined): boolean {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
}

export const GET: APIRoute = async ({ url }) => {
  try {
    if (!INSTAGRAM_ENABLED) {
      return new Response(
        JSON.stringify({ 
          error: 'Instagram integration disabled',
          message: 'Set INSTAGRAM_ENABLED=true to enable Instagram integration'
        }), 
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const clearCache = url.searchParams.get('clearCache') === 'true';
    
    if (clearCache) {
      cache.delete(CACHE_KEY);
      console.log('Instagram cache cleared');
    }

    // Verificar cache
    const cachedData = cache.get(CACHE_KEY);
    if (!clearCache && isCacheValid(cachedData)) {
      return new Response(
        JSON.stringify({
          success: true,
          data: cachedData!.data,
          cached: true,
          timestamp: cachedData!.timestamp
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obtener datos frescos
    const posts = await fetchInstagramPosts();
    
    // Guardar en cache
    cache.set(CACHE_KEY, {
      data: posts,
      timestamp: Date.now()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: posts,
        cached: false,
        timestamp: Date.now(),
        usingRealData: !!INSTAGRAM_ACCESS_TOKEN
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Instagram API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing post ID',
          message: 'Please provide a postId in the request body'
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Para agregar un post específico, necesitaríamos implementar lógica adicional
    // Por ahora, simplemente limpiamos el cache para refrescar los datos
    cache.delete(CACHE_KEY);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cache cleared, fresh data will be fetched on next request'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Invalid request',
        message: 'Please provide valid JSON in the request body'
      }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};