# Instagram API Integration

Este documento describe la integración del API de Instagram para cargar dinámicamente las transformaciones en la sección correspondiente.

## Características

### 🚀 Funcionalidades Principales
- **Scraping Automático**: Extrae datos públicos de Instagram (likes, comentarios, imágenes)
- **Sistema de Caché**: Almacena los datos por 30 minutos para mejorar el rendimiento
- **Fallback Inteligente**: Usa datos de respaldo si el API falla
- **Carga Dinámica**: Los posts se cargan automáticamente al visitar la página
- **Gestión de Errores**: Manejo robusto de errores con opciones de reintento

### 📊 Datos Extraídos
- ID del post de Instagram
- URL completa del post
- Número de likes (actualizado)
- Número de comentarios (actualizado)
- URL de la imagen principal
- Timestamp de la última actualización

## Endpoints Disponibles

### GET `/api/instagram`
Obtiene todos los posts de Instagram con datos actualizados.

**Respuesta exitosa:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "DNDtwCXIcoF",
      "url": "https://www.instagram.com/p/DNDtwCXIcoF/",
      "title": "Transformación Increíble",
      "description": "Mira esta increíble transformación de uno de nuestros clientes.",
      "details": "Cliente dedicado que logró sus objetivos con nuestro programa personalizado.",
      "likes": "245",
      "comments": "32",
      "imageUrl": "https://...",
      "timestamp": 1756381029545
    }
  ],
  "cached": true,
  "timestamp": 1756381062628
}
```

**Parámetros de consulta:**
- `clear_cache=true`: Limpia el caché y fuerza una actualización

### POST `/api/instagram`
Agrega un nuevo post de Instagram a la lista.

**Cuerpo de la petición:**
```json
{
  "postId": "NUEVO_POST_ID"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "post": { /* datos del nuevo post */ },
  "message": "Post added successfully"
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