'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Link as LinkIcon, Settings, User, Globe, Save } from 'lucide-react'

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Bogota', label: 'Bogota, Lima, Quito' },
  { value: 'America/Sao_Paulo', label: 'Brasilia, Sao Paulo' },
  { value: 'America/Mexico_City', label: 'Mexico City, Guadalajara' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires, Georgetown' },
  { value: 'America/Santiago', label: 'Santiago, Chile' },
  { value: 'Europe/London', label: 'London, Edinburgh, Dublin' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Rome, Madrid' },
  { value: 'Europe/Moscow', label: 'Moscow, St. Petersburg' },
  { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi' },
  { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi' },
  { value: 'Asia/Singapore', label: 'Singapore, Kuala Lumpur' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Osaka, Seoul' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai, Hong Kong' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne' },
  { value: 'Pacific/Auckland', label: 'Auckland, Wellington' },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    timezone: 'America/New_York',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchUserSettings()
    }
  }, [session])

  const fetchUserSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setFormData({
          name: data.name || '',
          username: data.username || data.email?.split('@')[0] || '',
          timezone: data.timezone || 'America/New_York',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const error = await res.json()
        alert(error.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const bookingLink = typeof window !== 'undefined'
    ? `${window.location.origin}/book/${formData.username}`
    : ''

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
              <Calendar className="w-5 h-5" />
              Dashboard
            </Link>
            <Link href="/dashboard/event-types" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <LinkIcon className="w-5 h-5" />
              Tipos de Evento
            </Link>
            <Link href="/dashboard/availability" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5" />
              Disponibilidad
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">
              <Settings className="w-5 h-5" />
              Configuracion
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Configuracion</h1>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Perfil
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de usuario (URL)
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                      zcal.app/book/
                    </span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tu-username"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tu link de booking: {bookingLink}
                  </p>
                </div>
              </div>
            </div>

            {/* Timezone Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Zona Horaria
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tu zona horaria
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} ({tz.value})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Esta zona horaria se usara para mostrar tu disponibilidad a los invitados.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {saved && (
                <span className="text-green-600 text-sm">Guardado exitosamente</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
