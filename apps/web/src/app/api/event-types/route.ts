import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventTypes = await prisma.eventType.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(eventTypes)
  } catch (error) {
    console.error('Error fetching event types:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, description, duration, locationType, color } = body

    // Verificar slug unico
    const existingSlug = await prisma.eventType.findFirst({
      where: {
        userId: session.user.id,
        slug,
      },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Ya tienes un evento con ese slug' },
        { status: 400 }
      )
    }

    const eventType = await prisma.eventType.create({
      data: {
        userId: session.user.id,
        title,
        slug,
        description,
        duration: duration || 30,
        locationType: locationType || 'GOOGLE_MEET',
        color: color || '#3b82f6',
      },
    })

    return NextResponse.json(eventType, { status: 201 })
  } catch (error) {
    console.error('Error creating event type:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
