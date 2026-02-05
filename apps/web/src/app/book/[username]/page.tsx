import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock } from 'lucide-react'

interface Props {
  params: { username: string }
}

interface EventType {
  id: string
  title: string
  slug: string
  description: string | null
  duration: number
  color: string
}

export default async function UserBookingPage({ params }: Props) {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        startsWith: params.username,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      eventTypes: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          duration: true,
          color: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const username = user.email?.split('@')[0]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || ''}
              className="w-20 h-20 rounded-full mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500">Selecciona un tipo de reunion para agendar</p>
        </div>

        {/* Event Types */}
        {user.eventTypes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <p className="text-gray-500">Este usuario no tiene eventos disponibles.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {user.eventTypes.map((eventType: EventType) => (
              <Link
                key={eventType.id}
                href={`/book/${username}/${eventType.slug}`}
                className="block bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-2 h-full min-h-[60px] rounded-full"
                    style={{ backgroundColor: eventType.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {eventType.title}
                    </h3>
                    {eventType.description && (
                      <p className="text-gray-500 text-sm mt-1">
                        {eventType.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {eventType.duration} minutos
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400">
            Powered by <span className="font-semibold text-blue-600">Zcal</span>
          </p>
        </div>
      </div>
    </div>
  )
}
