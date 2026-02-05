'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Video, Phone, MapPin } from 'lucide-react'

const DURATIONS = [15, 30, 45, 60, 90, 120]
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export default function NewEventTypePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: 30,
    locationType: 'GOOGLE_MEET',
    color: '#3b82f6',
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/event-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/dashboard/event-types')
      } else {
        const error = await res.json()
        alert(error.error || 'Error al crear')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el evento')
    } finally {
      setSaving(false)
    }
  }

  const username = session?.user?.email?.split('@')[0] || 'usuario'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        <Link
          href="/dashboard/event-types"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Nuevo tipo de evento</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview del link */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Tu link sera:</p>
            <p className="font-mono text-blue-800">
              {window.location.origin}/book/{username}/{formData.slug || 'tu-evento'}
            </p>
          </div>

          {/* Titulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titulo del evento
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ej: Reunion de 30 minutos"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL personalizada
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">/{username}/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Descripcion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripcion (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe brevemente de que trata esta reunion..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Duracion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duracion
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setFormData({ ...formData, duration })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    formData.duration === duration
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {duration} min
                </button>
              ))}
            </div>
          </div>

          {/* Ubicacion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicacion
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'GOOGLE_MEET', name: 'Google Meet', icon: Video },
                { id: 'PHONE', name: 'Telefono', icon: Phone },
                { id: 'IN_PERSON', name: 'En persona', icon: MapPin },
              ].map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, locationType: loc.id })}
                  className={`flex items-center gap-2 p-4 rounded-lg border transition-colors ${
                    formData.locationType === loc.id
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <loc.icon className="w-5 h-5" />
                  <span className="text-sm">{loc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Link
              href="/dashboard/event-types"
              className="flex-1 px-6 py-3 text-center text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
