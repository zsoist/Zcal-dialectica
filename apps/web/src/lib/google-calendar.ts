import { google } from 'googleapis'
import { prisma } from './prisma'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL + '/api/auth/callback/google'
)

interface CalendarEventParams {
  userId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  guestEmail: string
  guestName: string
}

export async function createCalendarEvent(params: CalendarEventParams): Promise<{
  eventId: string | null
  meetLink: string | null
}> {
  try {
    // Obtener el access token del usuario
    const account = await prisma.account.findFirst({
      where: {
        userId: params.userId,
        provider: 'google',
      },
    })

    if (!account?.access_token) {
      console.log('No Google account linked for user')
      return { eventId: null, meetLink: null }
    }

    // Verificar si el token ha expirado y necesita refresh
    if (account.expires_at && account.expires_at * 1000 < Date.now()) {
      if (account.refresh_token) {
        oauth2Client.setCredentials({
          refresh_token: account.refresh_token,
        })

        const { credentials } = await oauth2Client.refreshAccessToken()

        // Actualizar tokens en la base de datos
        await prisma.account.update({
          where: { id: account.id },
          data: {
            access_token: credentials.access_token,
            expires_at: credentials.expiry_date
              ? Math.floor(credentials.expiry_date / 1000)
              : undefined,
          },
        })

        oauth2Client.setCredentials(credentials)
      } else {
        console.log('Token expired and no refresh token available')
        return { eventId: null, meetLink: null }
      }
    } else {
      oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
      })
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Crear el evento con Google Meet
    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: params.title,
        description: params.description || `Reunión con ${params.guestName}`,
        start: {
          dateTime: params.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: params.endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: [
          { email: params.guestEmail, displayName: params.guestName },
        ],
        conferenceData: {
          createRequest: {
            requestId: `zcal-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      },
    })

    return {
      eventId: event.data.id || null,
      meetLink: event.data.hangoutLink || null,
    }
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return { eventId: null, meetLink: null }
  }
}

export async function deleteCalendarEvent(userId: string, eventId: string): Promise<boolean> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'google',
      },
    })

    if (!account?.access_token) {
      return false
    }

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    })

    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return false
  }
}
