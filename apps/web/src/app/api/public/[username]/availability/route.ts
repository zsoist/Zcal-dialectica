import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: { username: string }
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // formato: YYYY-MM-DD
    const eventSlug = searchParams.get('eventSlug')
    const guestTimezone = searchParams.get('timezone') || 'America/New_York'

    if (!date || !eventSlug) {
      return NextResponse.json(
        { error: 'Se requiere fecha y tipo de evento' },
        { status: 400 }
      )
    }

    // Buscar usuario por username o email prefix
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: params.username },
          { email: { startsWith: params.username } },
        ],
      },
      select: {
        id: true,
        timezone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener el evento para saber la duracion
    const eventType = await prisma.eventType.findFirst({
      where: {
        userId: user.id,
        slug: eventSlug,
        isActive: true,
      },
      select: {
        id: true,
        duration: true,
        bufferBefore: true,
        bufferAfter: true,
        minimumNotice: true,
      },
    })

    if (!eventType) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    // Obtener la disponibilidad del usuario
    const selectedDate = new Date(date + 'T00:00:00')
    const dayOfWeek = selectedDate.getDay()

    const availability = await prisma.availability.findFirst({
      where: {
        userId: user.id,
        dayOfWeek: dayOfWeek,
      },
    })

    if (!availability) {
      return NextResponse.json({ slots: [] })
    }

    // Obtener bookings existentes para esa fecha
    const startOfDay = new Date(date + 'T00:00:00Z')
    const endOfDay = new Date(date + 'T23:59:59Z')

    const existingBookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        status: { not: 'CANCELLED' },
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    })

    // Generar slots disponibles
    const slots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      eventType.duration,
      eventType.bufferBefore,
      eventType.bufferAfter,
      eventType.minimumNotice,
      selectedDate,
      existingBookings,
      user.timezone,
      guestTimezone
    )

    return NextResponse.json({
      slots,
      hostTimezone: user.timezone,
      duration: eventType.duration,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

interface Booking {
  startTime: Date
  endTime: Date
}

function generateTimeSlots(
  startMinutes: number,
  endMinutes: number,
  duration: number,
  bufferBefore: number,
  bufferAfter: number,
  minimumNotice: number,
  selectedDate: Date,
  existingBookings: Booking[],
  hostTimezone: string,
  guestTimezone: string
): string[] {
  const slots: string[] = []
  const now = new Date()

  // Intervalo de slots (15 minutos por defecto, o basado en la duracion)
  const slotInterval = duration <= 15 ? 5 : duration <= 30 ? 15 : 30

  for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += slotInterval) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    // Crear fecha/hora del slot en la zona horaria del host
    const slotDate = new Date(selectedDate)
    slotDate.setHours(hours, mins, 0, 0)

    // Verificar que el slot no sea en el pasado + minimo aviso
    const minimumNoticeTime = new Date(now.getTime() + minimumNotice * 60 * 1000)
    if (slotDate <= minimumNoticeTime) {
      continue
    }

    // Verificar que no haya conflicto con bookings existentes
    const slotEnd = new Date(slotDate.getTime() + duration * 60 * 1000)
    const slotStartWithBuffer = new Date(slotDate.getTime() - bufferBefore * 60 * 1000)
    const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferAfter * 60 * 1000)

    const hasConflict = existingBookings.some((booking) => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)

      return (
        (slotStartWithBuffer < bookingEnd && slotEndWithBuffer > bookingStart)
      )
    })

    if (!hasConflict) {
      // Formatear hora para mostrar
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }

  return slots
}
