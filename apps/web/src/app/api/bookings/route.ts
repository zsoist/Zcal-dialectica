import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      eventTypeId,
      guestName,
      guestEmail,
      guestNotes,
      startTime,
      guestTimezone,
    } = body

    // Validar campos requeridos
    if (!eventTypeId || !guestName || !guestEmail || !startTime) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { user: true },
    })

    if (!eventType) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    if (!eventType.isActive) {
      return NextResponse.json(
        { error: 'Este tipo de evento no está activo' },
        { status: 400 }
      )
    }

    const start = new Date(startTime)
    const end = new Date(start.getTime() + eventType.duration * 60000)

    // Validar que la fecha no esté en el pasado
    const now = new Date()
    if (start <= now) {
      return NextResponse.json(
        { error: 'No se puede reservar en el pasado' },
        { status: 400 }
      )
    }

    // Verificar conflictos con bookings existentes
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        userId: eventType.userId,
        status: { not: 'CANCELLED' },
        OR: [
          {
            // El nuevo booking empieza durante uno existente
            startTime: { lte: start },
            endTime: { gt: start },
          },
          {
            // El nuevo booking termina durante uno existente
            startTime: { lt: end },
            endTime: { gte: end },
          },
          {
            // El nuevo booking contiene completamente uno existente
            startTime: { gte: start },
            endTime: { lte: end },
          },
        ],
      },
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Este horario ya no está disponible' },
        { status: 409 }
      )
    }

    // Verificar que el día tenga disponibilidad configurada
    const dayOfWeek = start.getDay()
    const availability = await prisma.availability.findFirst({
      where: {
        userId: eventType.userId,
        dayOfWeek: dayOfWeek,
      },
    })

    if (!availability) {
      return NextResponse.json(
        { error: 'No hay disponibilidad para este día' },
        { status: 400 }
      )
    }

    // Crear el booking
    const booking = await prisma.booking.create({
      data: {
        userId: eventType.userId,
        eventTypeId,
        guestName,
        guestEmail,
        guestTimezone: guestTimezone || 'America/New_York',
        guestNotes: guestNotes || null,
        startTime: start,
        endTime: end,
        status: 'CONFIRMED',
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
