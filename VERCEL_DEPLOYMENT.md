# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu sitio web JocrisFit en Vercel con todas las funcionalidades del formulario de contacto.

## 📋 Requisitos Previos

### 1. Cuenta de Resend (para envío de emails)
1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Verifica tu dominio o usa el dominio de prueba
3. Ve a **API Keys** y crea una nueva clave
4. Copia la clave que empieza con `re_`

### 2. Cloudflare Turnstile (protección anti-spam)
1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Selecciona tu cuenta > **Turnstile**
3. Crea un nuevo sitio con tu dominio
4. Copia tanto la **Site Key** como la **Secret Key**

## 🚀 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Conecta tu repositorio:**
   - Ve a [vercel.com](https://vercel.com) e inicia sesión
   - Haz clic en "New Project"
   - Conecta tu repositorio de GitHub
   - Selecciona este proyecto

2. **Configura las variables de entorno:**
   En la sección "Environment Variables" agrega:
   
   ```
   RESEND_API_KEY=re_tu_clave_de_resend_aqui
   TURNSTILE_SECRET_KEY=0x4AAA_tu_secret_key_aqui
   PUBLIC_TURNSTILE_SITE_KEY=0x4AAA_tu_site_key_aqui
   CONTACT_EMAIL=tu_email@ejemplo.com
   INSTAGRAM_CACHE_DURATION=30
   INSTAGRAM_ENABLED=true
   ```

3. **Despliega:**
   - Haz clic en "Deploy"
   - Espera a que termine el proceso

### Opción 2: Desde CLI

1. **Instala Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Inicia sesión:**
   ```bash
   vercel login
   ```

3. **Despliega:**
   ```bash
   vercel
   ```

4. **Configura variables de entorno:**
   ```bash
   vercel env add RESEND_API_KEY
   vercel env add TURNSTILE_SECRET_KEY
   vercel env add PUBLIC_TURNSTILE_SITE_KEY
   vercel env add CONTACT_EMAIL
   ```

## ⚙️ Configuración Post-Despliegue

### 1. Actualizar Turnstile
- Ve a tu configuración de Turnstile en Cloudflare
- Agrega tu dominio de Vercel (ej: `tu-proyecto.vercel.app`)
- Actualiza las URLs permitidas

### 2. Configurar Resend
- Si usas un dominio personalizado, verifica el dominio en Resend
- Actualiza el email "from" en el código si es necesario

### 3. Probar el formulario
- Ve a tu sitio desplegado
- Prueba el formulario de contacto
- Verifica que recibes los emails

## 🔧 Solución de Problemas

### Error 500 en el formulario
- **Causa:** Variables de entorno no configuradas
- **Solución:** Verifica que todas las variables estén configuradas en Vercel

### Turnstile no funciona
- **Causa:** Dominio no configurado en Cloudflare
- **Solución:** Agrega tu dominio de Vercel en la configuración de Turnstile

### Emails no llegan
- **Causa:** Dominio no verificado en Resend
- **Solución:** Verifica tu dominio o usa el dominio de prueba

### Error de CORS
- **Causa:** Configuración de headers
- **Solución:** El archivo `vercel.json` ya incluye la configuración necesaria

## 📊 Monitoreo

### Logs en Vercel
- Ve a tu proyecto en Vercel
- Sección "Functions" > "View Function Logs"
- Revisa los logs de `/api/contact`

### Métricas de Resend
- Dashboard de Resend muestra emails enviados
- Revisa la sección "Logs" para errores

## 🔄 Actualizaciones

Cada vez que hagas push a tu rama principal, Vercel desplegará automáticamente los cambios.

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Prueba el endpoint directamente: `https://tu-dominio.vercel.app/api/contact`

---

✅ **¡Tu sitio está listo para producción!**

El formulario de contacto está optimizado para Vercel con:
- Validación robusta de variables de entorno
- Manejo de errores mejorado
- Configuración de CORS
- Timeouts apropiados
- Logging detallado