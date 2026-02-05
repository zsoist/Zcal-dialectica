'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, User, Mail, MessageSquare, Globe } from 'lucide-react'

interface EventType {
  id: string
  title: string
  description: string | null
  duration: number
  color: string
  locationType: string
  user: {
    name: string | null
    image: string | null
  }
}

interface AvailabilityResponse {
  slots: string[]
  hostTimezone: string
  duration: number
}

const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Bogota', label: 'Colombia (COT)' },
  { value: 'America/Sao_Paulo', label: 'Brazil (BRT)' },
  { value: 'America/Mexico_City', label: 'Mexico (CST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
]

export default function BookEventPage() {
  const params = useParams()
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [guestTimezone, setGuestTimezone] = useState(
    typeof window !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'America/New_York'
  )
  const [hostTimezone, setHostTimezone] = useState<string>('America/New_York')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  })
  const [success, setSuccess] = useState(false)
  const [availableDays, setAvailableDays] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchEventType()
    fetchAvailableDays()
  }, [params.username, params.eventSlug])

  useEffect(() => {
    if (selectedDate && eventType) {
      fetchAvailableTimes()
    }
  }, [selectedDate, guestTimezone, eventType])

  const fetchEventType = async () => {
    try {
      const res = await fetch(`/api/public/${params.username}/${params.eventSlug}`)
      if (res.ok) {
        const data = await res.json()
        setEventType(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableDays = async () => {
    try {
      // Obtener los dias de la semana donde el usuario tiene disponibilidad
      const res = await fetch(`/api/public/${params.username}/availability/days`)
      if (res.ok) {
        const data = await res.json()
        setAvailableDays(new Set(data.days))
      }
    } catch (error) {
      // Si falla, usar dias de semana por defecto (lunes a viernes)
      setAvailableDays(new Set([1, 2, 3, 4, 5]))
    }
  }

  const fetchAvailableTimes = async () => {
    if (!selectedDate || !eventType) return

    setLoadingSlots(true)
    try {
      const dateStr = formatDateForAPI(selectedDate)
      const res = await fetch(
        `/api/public/${params.username}/availability?date=${dateStr}&eventSlug=${params.eventSlug}&timezone=${guestTimezone}`
      )

      if (res.ok) {
        const data: AvailabilityResponse = await res.json()
        setAvailableTimes(data.slots)
        setHostTimezone(data.hostTimezone)
      } else {
        setAvailableTimes([])
      }
    } catch (error) {
      console.error('Error:', error)
      setAvailableTimes([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !eventType) return

    setSubmitting(true)
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const startTime = new Date(selectedDate)
      startTime.setHours(hours, minutes, 0, 0)

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTypeId: eventType.id,
          guestName: formData.name,
          guestEmail: formData.email,
          guestNotes: formData.notes,
          startTime: startTime.toISOString(),
          guestTimezone: guestTimezone,
        }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const error = await res.json()
        alert(error.error || 'Error al crear la reserva')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear la reserva')
    } finally {
      setSubmitting(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // Dias vacios antes del primer dia
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Dias del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fecha en el pasado
    if (date < today) return true

    // Verificar si el dia de la semana tiene disponibilidad
    const dayOfWeek = date.getDay()
    if (!availableDays.has(dayOfWeek)) return true

    return false
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const formatTimeWithTimezone = (time: string): string => {
    return time
  }

  const getLocationIcon = () => {
    switch (eventType?.locationType) {
      case 'GOOGLE_MEET':
        return '📹'
      case 'ZOOM':
        return '🎥'
      case 'PHONE':
        return '📞'
      case 'IN_PERSON':
        return '📍'
      default:
        return '💻'
    }
  }

  const getLocationText = () => {
    switch (eventType?.locationType) {
      case 'GOOGLE_MEET':
        return 'Google Meet'
      case 'ZOOM':
        return 'Zoom'
      case 'PHONE':
        return 'Llamada telefonica'
      case 'IN_PERSON':
        return 'Presencial'
      default:
        return 'Video llamada'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!eventType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Evento no encontrado</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reserva confirmada!</h2>
          <p className="text-gray-500 mb-4">
            Tu reunion con {eventType.user.name} ha sido agendada para el{' '}
            {selectedDate && formatDate(selectedDate)} a las {selectedTime}.
          </p>
          <div className="text-sm text-gray-400 space-y-1">
            <p>{getLocationIcon()} {getLocationText()}</p>
            <p>Duracion: {eventType.duration} minutos</p>
            <p>Zona horaria: {guestTimezone}</p>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Recibiras un email de confirmacion pronto.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Info del evento */}
            <div className="p-6 border-r border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                {eventType.user.image && (
                  <img
                    src={eventType.user.image}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm text-gray-500">{eventType.user.name}</p>
                  <h1 className="text-xl font-bold">{eventType.title}</h1>
                </div>
              </div>

              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{eventType.duration} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getLocationIcon()}</span>
                  <span>{getLocationText()}</span>
                </div>
              </div>

              {eventType.description && (
                <p className="text-gray-500 text-sm mt-4">{eventType.description}</p>
              )}

              {selectedDate && selectedTime && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">
                    {formatDate(selectedDate)}
                  </p>
                  <p className="text-blue-700">{selectedTime}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Zona horaria: {guestTimezone}
                  </p>
                </div>
              )}
            </div>

            {/* Calendario o formulario */}
            <div className="p-6">
              {!showForm ? (
                <>
                  {/* Selector de zona horaria */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Globe className="w-4 h-4" />
                      Tu zona horaria
                    </label>
                    <select
                      value={guestTimezone}
                      onChange={(e) => setGuestTimezone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Navegacion del mes */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="font-semibold capitalize">
                      {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Dias de la semana */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendario */}
                  <div className="grid grid-cols-7 gap-1 mb-6">
                    {getDaysInMonth(currentMonth).map((date, i) => (
                      <div key={i} className="aspect-square">
                        {date && (
                          <button
                            onClick={() => !isDateDisabled(date) && setSelectedDate(date)}
                            disabled={isDateDisabled(date)}
                            className={`w-full h-full flex items-center justify-center rounded-full text-sm transition-colors
                              ${isDateDisabled(date) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                              ${selectedDate?.toDateString() === date.toDateString() ? 'bg-blue-600 text-white' : ''}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Horarios */}
                  {selectedDate && (
                    <div>
                      <h3 className="font-medium mb-3">Horarios disponibles</h3>
                      {loadingSlots ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        </div>
                      ) : availableTimes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {availableTimes.map((time) => (
                            <button
                              key={time}
                              onClick={() => {
                                setSelectedTime(time)
                                setShowForm(true)
                              }}
                              className={`py-2 px-3 text-sm rounded-lg border transition-colors
                                ${selectedTime === time
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-gray-300 hover:border-blue-600 hover:text-blue-600'
                                }
                              `}
                            >
                              {formatTimeWithTimezone(time)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No hay horarios disponibles para esta fecha
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Formulario de confirmacion */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                  >
                    ← Volver al calendario
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Tu nombre
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Tu email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Reservando...' : 'Confirmar reserva'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
