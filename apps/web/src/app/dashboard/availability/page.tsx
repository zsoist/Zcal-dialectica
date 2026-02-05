'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Plus, Trash2 } from 'lucide-react'

const DAYS = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miercoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sabado' },
]

interface DaySchedule {
  enabled: boolean
  startTime: string
  endTime: string
}

interface AvailabilitySlot {
  dayOfWeek: number
  startTime: number
  endTime: number
}

export default function AvailabilityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>({
    0: { enabled: false, startTime: '09:00', endTime: '17:00' },
    1: { enabled: true, startTime: '09:00', endTime: '17:00' },
    2: { enabled: true, startTime: '09:00', endTime: '17:00' },
    3: { enabled: true, startTime: '09:00', endTime: '17:00' },
    4: { enabled: true, startTime: '09:00', endTime: '17:00' },
    5: { enabled: true, startTime: '09:00', endTime: '17:00' },
    6: { enabled: false, startTime: '09:00', endTime: '17:00' },
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAvailability()
    }
  }, [session])

  const fetchAvailability = async () => {
    try {
      const res = await fetch('/api/availability')
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          const newSchedule: Record<number, DaySchedule> = { ...schedule }
          // Reset all to disabled first
          Object.keys(newSchedule).forEach((key) => {
            newSchedule[Number(key)].enabled = false
          })
          // Enable days that have availability
          data.forEach((slot: AvailabilitySlot) => {
            const hours = Math.floor(slot.startTime / 60)
            const mins = slot.startTime % 60
            const endHours = Math.floor(slot.endTime / 60)
            const endMins = slot.endTime % 60
            newSchedule[slot.dayOfWeek] = {
              enabled: true,
              startTime: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
              endTime: `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`,
            }
          })
          setSchedule(newSchedule)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const slots = Object.entries(schedule)
        .filter(([_, value]) => value.enabled)
        .map(([day, value]) => {
          const [startHour, startMin] = value.startTime.split(':').map(Number)
          const [endHour, endMin] = value.endTime.split(':').map(Number)
          return {
            dayOfWeek: Number(day),
            startTime: startHour * 60 + startMin,
            endTime: endHour * 60 + endMin,
          }
        })

      await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      })

      alert('Disponibilidad guardada')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar')
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
            <Link href="/dashboard/event-types" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Tipos de Evento
            </Link>
            <Link href="/dashboard/availability" className="flex items-center gap-3 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">
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
            <h1 className="text-2xl font-bold text-gray-900">Disponibilidad</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 divide-y">
            {DAYS.map((day) => (
              <div key={day.id} className="p-4 flex items-center gap-4">
                <label className="flex items-center gap-3 w-32">
                  <input
                    type="checkbox"
                    checked={schedule[day.id].enabled}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        [day.id]: { ...schedule[day.id], enabled: e.target.checked },
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="font-medium">{day.name}</span>
                </label>

                {schedule[day.id].enabled ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={schedule[day.id].startTime}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          [day.id]: { ...schedule[day.id], startTime: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="time"
                      value={schedule[day.id].endTime}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          [day.id]: { ...schedule[day.id], endTime: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No disponible</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
