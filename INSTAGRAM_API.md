# Instagram Basic Display API Integration

Este documento describe la integración con la Instagram Basic Display API para mostrar fotos reales de Instagram en la sección de Transformaciones.

## Características

- **API oficial de Instagram**: Usa Instagram Basic Display API para datos reales
- **Autenticación OAuth**: Flujo completo de autorización
- **Sistema de caché**: Almacena datos por tiempo configurable
- **Fallback inteligente**: Datos simulados cuando no hay access token
- **Manejo de errores**: Robusto manejo de errores de API

## Configuración inicial

### 1. Crear aplicación en Facebook Developers

1. Ve a [Facebook Developers](https://developers.facebook.com/apps/)
2. Crea una nueva aplicación
3. Agrega el producto "Instagram Basic Display"
4. Configura la URL de redirección: `http://localhost:4321/api/instagram/callback`

### 2. Variables de entorno

Agrega estas variables a tu archivo `.env`:

```env
# Instagram Basic Display API Configuration
INSTAGRAM_APP_ID=tu_app_id_aqui
INSTAGRAM_APP_SECRET=tu_app_secret_aqui
INSTAGRAM_REDIRECT_URI=http://localhost:4321/api/instagram/callback
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_CACHE_DURATION=30
INSTAGRAM_ENABLED=true
```

### 3. Obtener Access Token

1. Visita: `http://localhost:4321/api/instagram/auth`
2. Autoriza la aplicación en Instagram
3. Copia el `access_token` de la respuesta
4. Agrégalo a tu `.env` como `INSTAGRAM_ACCESS_TOKEN`
5. Reinicia el servidor de desarrollo

## Datos obtenidos

Para cada post de Instagram se obtiene:
- ID del post
- URL de la imagen (o thumbnail para videos)
- Número de likes reales
- Número de comentarios reales
- Caption del post
- Timestamp de publicación

## Endpoints disponibles

### GET /api/instagram/auth
Inicia el flujo de autenticación OAuth con Instagram.

**Respuesta:** Redirección a Instagram para autorización

### GET /api/instagram/callback
Maneja la respuesta de Instagram después de la autorización.

**Respuesta:**
```json
{
  "success": true,
  "message": "Authorization successful! Copy this access token to your .env file:",
  "access_token": "IGQVJ...",
  "expires_in": 5183944,
  "token_type": "bearer",
  "instructions": {
    "step1": "Copy the access_token value",
    "step2": "Add it to your .env file as INSTAGRAM_ACCESS_TOKEN=your_token_here",
    "step3": "Restart your development server",
    "step4": "Your Instagram API will now use real data"
  }
}
```

### GET `/api/instagram`
Obtiene la lista de posts de Instagram del usuario autenticado.

**Parámetros de consulta:**
- `clearCache=true`: Limpia el caché y obtiene datos frescos

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "17841234567890123",
      "imageUrl": "https://scontent.cdninstagram.com/v/...",
      "likes": "127",
      "comments": "23",
      "caption": "Entrenamiento de fuerza - Transformación en progreso 💪",
      "timestamp": "2024-01-15T10:30:00+0000"
    }
  ],
  "cached": false,
  "timestamp": 1703123456789,
  "usingRealData": true
}
```

### POST `/api/instagram`
Limpia el caché para forzar actualización de datos.

**Cuerpo de la petición:**
```json
{
  "postId": "cualquier_valor"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Cache cleared, fresh data will be fetched on next request"
}
```

## Configuración

### Variables de Entorno
Agrega estas variables a tu archivo `.env`:

```env
# Instagram API Configuration
INSTAGRAM_CACHE_DURATION=30        # Duración del caché en minutos
INSTAGRAM_RATE_LIMIT=100           # Límite de requests por hora
INSTAGRAM_ENABLED=true             # Habilitar/deshabilitar scraping
```

### Agregar Nuevos Posts

1. **Método 1: Editar el código**
   ```typescript
   // En src/pages/api/instagram.ts
   const INSTAGRAM_POST_IDS = [
     'DNDtwCXIcoF',
     'NUEVO_POST_ID_AQUI', // Agregar aquí
   ];
   ```

2. **Método 2: Usar el endpoint POST**
   ```bash
   curl -X POST http://localhost:4321/api/instagram \
     -H "Content-Type: application/json" \
     -d '{"postId": "NUEVO_POST_ID"}'
   ```

## Uso en el Frontend

El componente `Transformations.astro` ahora:

1. **Carga Automática**: Al cargar la página, hace una petición a `/api/instagram`
2. **Renderizado Dinámico**: Crea las cards de Instagram con datos reales
3. **Fallback**: Si el API falla, usa datos de respaldo predefinidos
4. **Gestión de Estados**: Muestra loading, error y estados de éxito

### Flujo de Carga
```
1. Página carga → Muestra spinner de carga
2. Fetch a /api/instagram → Obtiene datos (caché o scraping)
3. Renderiza posts → Crea HTML dinámicamente
4. Carga iframes → Embeds de Instagram
5. Oculta spinners → Muestra contenido final
```

## Limitaciones y Consideraciones

## ⚠️ Limitaciones y Soluciones

### Problema de Scraping Resuelto

**Problema**: Instagram bloquea el web scraping directo y ha eliminado `window._sharedData`.

**Solución Implementada**: 
- **Método Primario**: Intenta usar Instagram oEmbed API para obtener datos básicos
- **Método Fallback**: Genera datos simulados realistas basados en el ID del post
- **Datos Consistentes**: Los números generados son siempre los mismos para cada post ID

### Limitaciones Actuales

1. **Datos Simulados**: Los likes y comentarios son generados algorítmicamente
2. **Posts Privados**: Solo funciona con posts públicos
3. **API Oficial Requerida**: Para datos reales se necesita Instagram Basic Display API
4. **Imágenes Placeholder**: Se usan imágenes de Picsum en lugar de las reales de Instagram

### 🚨 Limitaciones Técnicas
- **Rate Limiting**: Instagram puede bloquear requests excesivos
- **Cambios de Estructura**: Instagram puede cambiar su HTML
- **CORS**: Algunos requests pueden fallar por políticas de CORS
- **Detección de Bots**: Instagram puede detectar y bloquear scraping

### 💡 Mejores Prácticas
- **Caché Inteligente**: El sistema usa caché de 30 minutos por defecto
- **Fallback Robusto**: Siempre tiene datos de respaldo disponibles
- **Monitoreo**: Revisa los logs para detectar fallos de scraping
- **Actualizaciones Manuales**: Usa `?clear_cache=true` para forzar actualizaciones

### 🔧 Troubleshooting

**Problema: Posts no se cargan**
```bash
# Verificar el endpoint
curl http://localhost:4321/api/instagram

# Limpiar caché
curl "http://localhost:4321/api/instagram?clear_cache=true"
```

**Problema: Datos desactualizados**
- El caché dura 30 minutos por defecto
- Usa `clear_cache=true` para forzar actualización
- Verifica que `INSTAGRAM_ENABLED=true` en `.env`

**Problema: Scraping falla**
- Instagram puede haber cambiado su estructura
- Verifica los logs del servidor para errores específicos
- El sistema automáticamente usa datos de fallback

## Futuras Mejoras

### 🎯 Roadmap

**Para Obtener Datos Reales de Instagram**

**Opción 1: Instagram Basic Display API**
```bash
# 1. Crear una app en Facebook Developers
# 2. Configurar Instagram Basic Display
# 3. Obtener access token
# 4. Usar endpoints oficiales:

# Obtener posts del usuario
GET https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token={ACCESS_TOKEN}

# Obtener detalles de un post específico
GET https://graph.instagram.com/{MEDIA_ID}?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token={ACCESS_TOKEN}
```

**Opción 2: Instagram Graph API (Para Business)**
```bash
# Requiere Instagram Business Account
GET https://graph.facebook.com/v18.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token={ACCESS_TOKEN}
```

**Variables de Entorno Adicionales Necesarias**
```env
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
INSTAGRAM_USER_ID=your_instagram_user_id_here
INSTAGRAM_APP_ID=your_facebook_app_id_here
INSTAGRAM_APP_SECRET=your_facebook_app_secret_here
```

**Otras Mejoras Técnicas**
- [ ] **Redis Cache**: Reemplazar caché en memoria
- [ ] **Webhook Updates**: Actualizaciones automáticas vía webhooks
- [ ] **Admin Panel**: Interface para gestionar posts
- [ ] **Analytics**: Métricas de engagement y rendimiento
- [ ] **CDN Integration**: Caché de imágenes en CDN
- [ ] **Análisis de sentimientos** en comentarios usando AI
- [ ] **Programación de posts** y análisis de mejor horario para publicar

### 🔐 Seguridad
- [ ] **Rate Limiting**: Implementar límites por IP
- [ ] **Authentication**: Proteger endpoints administrativos
- [ ] **Input Validation**: Validación más robusta de post IDs
- [ ] **Error Sanitization**: Limpiar errores antes de mostrar al usuario

## Soporte

Para problemas o preguntas sobre la integración de Instagram:

1. **Revisa los logs**: `npm run dev` muestra errores en consola
2. **Verifica el endpoint**: Usa `curl` para probar directamente
3. **Limpia el caché**: Agrega `?clear_cache=true` a la URL
4. **Revisa las variables**: Confirma que `.env` esté configurado correctamente

---

**Nota**: Esta integración usa web scraping de datos públicos de Instagram. Para uso en producción a gran escala, considera migrar a la Instagram Basic Display API oficial.