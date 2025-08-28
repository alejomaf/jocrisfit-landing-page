import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
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
        secret: import.meta.env.TURNSTILE_SECRET_KEY,
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
      from: 'Formulario de Contacto <noreply@yourdomain.com>',
      to: [import.meta.env.CONTACT_EMAIL],
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      text: `
        Nuevo mensaje de contacto
        
        Nombre: ${name}
        Email: ${email}
        Mensaje: ${message}
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