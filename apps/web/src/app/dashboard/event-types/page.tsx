'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Link as LinkIcon, Clock, MoreVertical, Copy, ExternalLink } from 'lucide-react'

interface EventType {
  id: string
  title: string
  slug: string
  duration: number
  color: string
  isActive: boolean
}

export default function EventTypesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchEventTypes()
    }
  }, [session])

  const fetchEventTypes = async () => {
    try {
      const res = await fetch('/api/event-types')
      if (res.ok) {
        const data = await res.json()
        setEventTypes(data)
      }
    } catch (error) {
      console.error('Error fetching event types:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const username = session?.user?.email?.split('@')[0] || 'usuario'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">Zcal</Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Dashboard
            </Link>
            <Link href="/dashboard/event-types" className="flex items-center gap-3 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">
              <LinkIcon className="w-5 h-5" />
              Tipos de Evento
            </Link>
            <Link href="/dashboard/availability" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5" />
              Disponibilidad
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Tipos de Evento</h1>
            <Link
              href="/dashboard/event-types/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </Link>
          </div>

          {eventTypes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tienes tipos de evento</h3>
              <p className="text-gray-500 mb-6">Crea tu primer tipo de evento para empezar a recibir reservas.</p>
              <Link
                href="/dashboard/event-types/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Crear tipo de evento
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {eventTypes.map((eventType) => (
                <div
                  key={eventType.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-12 rounded-full"
                        style={{ backgroundColor: eventType.color }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{eventType.title}</h3>
                        <p className="text-sm text-gray-500">
                          {eventType.duration} minutos • /{username}/{eventType.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${username}/${eventType.slug}`)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Copiar link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/book/${username}/${eventType.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Ver pagina"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
