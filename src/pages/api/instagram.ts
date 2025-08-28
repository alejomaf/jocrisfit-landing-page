import type { APIRoute } from 'astro';

interface InstagramPost {
  id: string;
  url: string;
  title: string;
  description: string;
  details: string;
  likes: string;
  comments: string;
  imageUrl?: string;
  timestamp?: number;
}

interface CacheEntry {
  data: InstagramPost[];
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();
const CACHE_KEY = 'instagram_posts';
const CACHE_DURATION = parseInt(import.meta.env.INSTAGRAM_CACHE_DURATION || '30') * 60 * 1000;

// Función para obtener posts usando datos estáticos de transformaciones
async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  return await getStaticTransformationPosts();
}

// Función para obtener ID del post desde URL
function getId(url: string): string | null {
  const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/;
  const match = url.match(regex);
  return match && match[2] ? match[2] : null;
}

// Función para obtener datos de Instagram usando GraphQL API
async function getInstagramGraphqlData(url: string): Promise<any> {
  const igId = getId(url);
  if (!igId) return null;

  // Variables de entorno para headers
  const _userAgent = process.env.USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const _xIgAppId = process.env.X_IG_APP_ID || '936619743392459';

  // Crear URL de GraphQL
  const graphql = new URL('https://www.instagram.com/api/graphql');
  graphql.searchParams.set('variables', JSON.stringify({ shortcode: igId }));
  graphql.searchParams.set('doc_id', '10015901848480474');
  graphql.searchParams.set('lsd', 'AVqbxe3J_YA');

  const response = await fetch(graphql, {
    method: 'POST',
    headers: {
      'User-Agent': _userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-IG-App-ID': _xIgAppId,
      'X-FB-LSD': 'AVqbxe3J_YA',
      'X-ASBD-ID': '129477',
      'Sec-Fetch-Site': 'same-origin'
    }
  });

  const json = await response.json();
  const items = json?.data?.xdt_shortcode_media;

  return {
    __typename: items?.__typename,
    shortcode: items?.shortcode,
    dimensions: items?.dimensions,
    display_url: items?.display_url,
    display_resources: items?.display_resources,
    has_audio: items?.has_audio,
    video_url: items?.video_url,
    video_view_count: items?.video_view_count,
    video_play_count: items?.video_play_count,
    is_video: items?.is_video,
    caption: items?.edge_media_to_caption?.edges[0]?.node?.text,
    is_paid_partnership: items?.is_paid_partnership,
    location: items?.location,
    owner: items?.owner,
    product_type: items?.product_type,
    video_duration: items?.video_duration,
    thumbnail_src: items?.thumbnail_src,
    clips_music_attribution_info: items?.clips_music_attribution_info,
    sidecar: items?.edge_sidecar_to_children?.edges,
    like_count: items?.edge_media_preview_like?.count,
    comment_count: items?.edge_media_to_parent_comment?.count
  };
}

// Función para obtener datos reales de Instagram usando GraphQL
async function scrapeInstagramPost(postUrl: string): Promise<InstagramPost | null> {
  try {
    const postId = postUrl.split('/p/')[1]?.split('/')[0];
    if (!postId) return null;

    console.log(`Intentando obtener datos del post: ${postId}`);
    
    // Usar GraphQL API de Instagram
    const postData = await getInstagramGraphqlData(postUrl);
    
    if (postData && postData.display_url) {
      return {
        id: postId,
        url: postUrl,
        imageUrl: postData.display_url,
        title: "Transformación JocrisFit",
        description: postData.caption ? postData.caption.substring(0, 100) + '...' : "Increíble transformación de uno de nuestros clientes",
        details: "Resultados reales obtenidos con nuestro programa personalizado",
        likes: postData.like_count?.toString() || "0",
        comments: postData.comment_count?.toString() || "0",
        timestamp: Date.now()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error scraping Instagram post:', error);
    return null;
  }
}

// Función para obtener transformaciones reales
async function getStaticTransformationPosts(): Promise<InstagramPost[]> {
  const postUrl = "https://www.instagram.com/p/DNDtwCXIcoF/";
  const scrapedPost = await scrapeInstagramPost(postUrl);
  
  if (scrapedPost) {
    return [scrapedPost];
  }
  
  // Fallback con datos básicos si el scraping falla
  return [
    {
      id: "DNDtwCXIcoF",
      url: postUrl,
      imageUrl: "https://scontent-mad1-1.cdninstagram.com/v/t51.29350-15/470726064_18473067816046978_8087516799988776416_n.jpg",
      title: "Transformación JocrisFit",
      description: "Increíble transformación de uno de nuestros clientes",
      details: "Resultados reales obtenidos con nuestro programa personalizado",
      likes: "0",
      comments: "0",
      timestamp: Date.now()
    }
  ];
}

// Función de fallback (mantenida para compatibilidad)
function getFallbackPosts(): InstagramPost[] {
  return [];
}

// Función para verificar si el cache es válido
function isCacheValid(cacheEntry: CacheEntry | undefined): boolean {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
}

export const GET: APIRoute = async ({ url }) => {
  try {
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
        usingStaticData: true
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