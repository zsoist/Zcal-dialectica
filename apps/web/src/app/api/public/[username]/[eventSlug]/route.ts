import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: { username: string; eventSlug: string }
}

export async function GET(request: Request, { params }: Props) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          startsWith: params.username,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const eventType = await prisma.eventType.findFirst({
      where: {
        userId: user.id,
        slug: params.eventSlug,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        color: true,
        locationType: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    if (!eventType) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    return NextResponse.json(eventType)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
