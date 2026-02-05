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

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { user: true },
    })

    if (!eventType) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    const start = new Date(startTime)
    const end = new Date(start.getTime() + eventType.duration * 60000)

    const booking = await prisma.booking.create({
      data: {
        userId: eventType.userId,
        eventTypeId,
        guestName,
        guestEmail,
        guestTimezone: guestTimezone || 'America/New_York',
        guestNotes,
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
