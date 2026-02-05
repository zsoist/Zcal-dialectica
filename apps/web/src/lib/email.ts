import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface BookingEmailParams {
  guestEmail: string
  guestName: string
  hostName: string
  eventTitle: string
  startTime: Date
  endTime: Date
  meetLink?: string | null
  timezone: string
}

export async function sendBookingConfirmation(params: BookingEmailParams): Promise<boolean> {
  if (!resend) {
    console.log('Resend not configured, skipping email')
    return false
  }

  const formattedDate = params.startTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: params.timezone,
  })

  const formattedTime = params.startTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: params.timezone,
  })

  const endTime = params.endTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: params.timezone,
  })

  try {
    await resend.emails.send({
      from: 'Zcal <noreply@resend.dev>',
      to: params.guestEmail,
      subject: `Confirmado: ${params.eventTitle} con ${params.hostName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .details { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; }
            .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
            .detail-label { font-weight: 600; width: 120px; color: #6b7280; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
            .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Reserva Confirmada</h1>
            </div>
            <div class="content">
              <p>Hola ${params.guestName},</p>
              <p>Tu reunión ha sido confirmada exitosamente.</p>

              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Evento:</span>
                  <span>${params.eventTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Con:</span>
                  <span>${params.hostName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha:</span>
                  <span>${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hora:</span>
                  <span>${formattedTime} - ${endTime}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Zona horaria:</span>
                  <span>${params.timezone}</span>
                </div>
              </div>

              ${params.meetLink ? `
                <p><strong>Link de la reunión:</strong></p>
                <a href="${params.meetLink}" class="button">Unirse a Google Meet</a>
                <p style="margin-top: 12px; font-size: 14px; color: #6b7280;">
                  O copia este link: ${params.meetLink}
                </p>
              ` : ''}
            </div>
            <div class="footer">
              <p>Powered by Zcal</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function sendBookingNotificationToHost(params: BookingEmailParams & { hostEmail: string }): Promise<boolean> {
  if (!resend) {
    console.log('Resend not configured, skipping host notification')
    return false
  }

  const formattedDate = params.startTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formattedTime = params.startTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  try {
    await resend.emails.send({
      from: 'Zcal <noreply@resend.dev>',
      to: params.hostEmail,
      subject: `Nueva reserva: ${params.eventTitle} con ${params.guestName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .details { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; }
            .detail-row { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
            .detail-label { font-weight: 600; color: #6b7280; }
            .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Nueva Reserva</h1>
            </div>
            <div class="content">
              <p>Hola ${params.hostName},</p>
              <p>Tienes una nueva reserva:</p>

              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Invitado:</span>
                  <p style="margin: 4px 0;">${params.guestName} (${params.guestEmail})</p>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Evento:</span>
                  <p style="margin: 4px 0;">${params.eventTitle}</p>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha y hora:</span>
                  <p style="margin: 4px 0;">${formattedDate} a las ${formattedTime}</p>
                </div>
              </div>

              ${params.meetLink ? `
                <p><strong>Link de Google Meet:</strong> <a href="${params.meetLink}">${params.meetLink}</a></p>
              ` : ''}
            </div>
            <div class="footer">
              <p>Powered by Zcal</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return true
  } catch (error) {
    console.error('Error sending host notification:', error)
    return false
  }
}
