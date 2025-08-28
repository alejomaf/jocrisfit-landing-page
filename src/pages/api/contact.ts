import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Validar variables de entorno al inicializar
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const TURNSTILE_SECRET_KEY = import.meta.env.TURNSTILE_SECRET_KEY;
const CONTACT_EMAIL = import.meta.env.CONTACT_EMAIL;

if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY no está configurada');
}

if (!TURNSTILE_SECRET_KEY) {
  console.error('TURNSTILE_SECRET_KEY no está configurada');
}

if (!CONTACT_EMAIL) {
  console.error('CONTACT_EMAIL no está configurada');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar configuración antes de procesar
    if (!resend || !TURNSTILE_SECRET_KEY || !CONTACT_EMAIL) {
      console.error('Configuración incompleta:', {
        resend: !!resend,
        turnstile: !!TURNSTILE_SECRET_KEY,
        email: !!CONTACT_EMAIL
      });
      return new Response(
        JSON.stringify({ error: 'Servicio temporalmente no disponible' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const service = formData.get('service') as string;
    const message = formData.get('message') as string;
    const turnstileToken = formData.get('cf-turnstile-response') as string;

    // Validar campos requeridos
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar Turnstile
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: 'Verificación de seguridad requerida' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar Turnstile con Cloudflare
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return new Response(
        JSON.stringify({ error: 'Verificación de seguridad fallida' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Enviar email con Resend
    const emailResult = await resend.emails.send({
      from: 'Formulario de Contacto <noreply@jocrisfit.com>',
      to: [CONTACT_EMAIL],
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Nuevo mensaje de contacto</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${service ? `<p><strong>Servicio de interés:</strong> ${service}</p>` : ''}
            <p><strong>Mensaje:</strong></p>
            <div style="background: white; padding: 15px; border-left: 4px solid #f59e0b; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px;">Este mensaje fue enviado desde el formulario de contacto de JocrisFit.</p>
        </div>
      `,
      text: `
Nuevo mensaje de contacto

Nombre: ${name}
Email: ${email}
${service ? `Servicio: ${service}\n` : ''}Mensaje: ${message}

---
Enviado desde JocrisFit
      `,
    });

    if (emailResult.error) {
      console.error('Error enviando email:', emailResult.error);
      return new Response(
        JSON.stringify({ error: 'Error enviando el mensaje' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Mensaje enviado correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en el endpoint de contacto:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};