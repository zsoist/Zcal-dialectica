'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Calendar, Clock, Link as LinkIcon, Settings, LogOut, Plus, Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!session) return null

  const username = session.user?.email?.split('@')[0] || 'usuario'
  const bookingLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${username}`

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <span className="text-2xl font-bold text-blue-600">Zcal</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg"
            >
              <Calendar className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/event-types"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LinkIcon className="w-5 h-5" />
              Tipos de Evento
            </Link>
            <Link
              href="/dashboard/availability"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Clock className="w-5 h-5" />
              Disponibilidad
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5" />
              Configuracion
            </Link>
          </nav>

          {/* User */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Cerrar sesion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Bienvenido, {session.user?.name?.split(' ')[0]}
          </h1>

          {/* Quick link */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold mb-4">Tu link de booking</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={bookingLink}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/dashboard/event-types/new"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Crear tipo de evento</h3>
                  <p className="text-sm text-gray-500">Configura una nueva reunion</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/availability"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Configurar disponibilidad</h3>
                  <p className="text-sm text-gray-500">Define tus horarios</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
