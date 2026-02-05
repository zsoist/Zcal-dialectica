import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: { username: string }
}

interface AvailabilityDay {
  dayOfWeek: number
}

export async function GET(request: Request, { params }: Props) {
  try {
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
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener los días de la semana donde el usuario tiene disponibilidad
    const availability = await prisma.availability.findMany({
      where: {
        userId: user.id,
      },
      select: {
        dayOfWeek: true,
      },
      distinct: ['dayOfWeek'],
    })

    const days = availability.map((a: AvailabilityDay) => a.dayOfWeek)

    return NextResponse.json({ days })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
