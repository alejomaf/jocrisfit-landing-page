# Configuración del Backend

Esta aplicación incluye un backend básico para manejar el formulario de contacto con Resend y Turnstile de Cloudflare.

## Variables de Entorno Requeridas

Copia el archivo `.env.example` a `.env` y configura las siguientes variables:

```bash
cp .env.example .env
```

### 1. Resend (Envío de Emails)

1. Regístrate en [Resend](https://resend.com)
2. Crea una API Key en el dashboard
3. Configura `RESEND_API_KEY` en tu `.env`
4. Configura `CONTACT_EMAIL` con el email donde quieres recibir los mensajes

### 2. Cloudflare Turnstile (Anti-spam)

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a "Turnstile" en el menú lateral
3. Crea un nuevo sitio
4. Copia la "Site Key" y "Secret Key"
5. Configura:
   - `PUBLIC_TURNSTILE_SITE_KEY` (visible en el frontend)
   - `TURNSTILE_SECRET_KEY` (privada, solo backend)

## Despliegue en Vercel

### 1. Configuración Local

La aplicación ya está configurada para Vercel con:
- Adaptador `@astrojs/vercel/serverless`
- Modo `server` para APIs
- Endpoint `/api/contact` para el formulario

### 2. Variables de Entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a Settings > Environment Variables
3. Agrega todas las variables del archivo `.env`:
   - `RESEND_API_KEY`
   - `TURNSTILE_SECRET_KEY`
   - `PUBLIC_TURNSTILE_SITE_KEY`
   - `CONTACT_EMAIL`

### 3. Despliegue

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Desplegar
vercel
```

O conecta tu repositorio de GitHub directamente en Vercel para despliegues automáticos.

## Estructura del Backend

```
src/
├── pages/
│   └── api/
│       └── contact.ts    # Endpoint del formulario
└── components/
    └── Contact.astro     # Formulario con Turnstile
```

## Funcionalidades

- ✅ Validación de formulario en frontend y backend
- ✅ Protección anti-spam con Cloudflare Turnstile
- ✅ Envío de emails con Resend
- ✅ Manejo de errores y respuestas
- ✅ Variables de entorno seguras
- ✅ Listo para producción en Vercel

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves

# Ejecutar en desarrollo
npm run dev
```

El formulario estará disponible en `http://localhost:4321/#contacto`