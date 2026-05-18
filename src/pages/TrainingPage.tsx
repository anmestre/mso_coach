import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, ClipboardList, Clock, MapPin } from 'lucide-react'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAppStore } from '../stores/useAppStore'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import type { SessionType } from '../types'

const sessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  duration_minutes: z.coerce.number().int().min(15).max(300),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['technical', 'tactical', 'physical', 'recovery', 'set_pieces', 'scrimmage', 'mixed']),
  description: z.string().optional(),
  objectives: z.string().optional(),
})
type SessionForm = z.infer<typeof sessionSchema>

const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  technical: 'info',
  tactical: 'success',
  physical: 'danger',
  recovery: 'warning',
  set_pieces: 'neutral',
  scrimmage: 'neutral',
  mixed: 'neutral',
}

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  technical: 'Technical',
  tactical: 'Tactical',
  physical: 'Physical',
  recovery: 'Recovery',
  set_pieces: 'Set Pieces',
  scrimmage: 'Scrimmage',
  mixed: 'Mixed',
}

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

export function TrainingPage() {
  const { trainingSessions, addTrainingSession, currentSeason } = useAppStore()
  const [showModal, setShowModal] = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<SessionForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(sessionSchema) as any,
    defaultValues: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      duration_minutes: 90,
      location: 'Campo Municipal',
      type: 'mixed',
      description: '',
      objectives: '',
    },
  })

  const onSubmit: SubmitHandler<SessionForm> = (data) => {
    addTrainingSession({
      season_id: currentSeason.id,
      title: data.title,
      date: new Date(data.date).toISOString(),
      duration_minutes: data.duration_minutes,
      location: data.location,
      type: data.type as SessionType,
      description: data.description || undefined,
      objectives: data.objectives ? data.objectives.split('\n').filter(Boolean) : [],
    })
    toast.success('Training session added!')
    reset()
    setShowModal(false)
  }

  const sorted = [...trainingSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Training</h1>
          <p className="text-slate-500 text-sm mt-0.5">{trainingSessions.length} sessions logged</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Session
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <ClipboardList size={28} className="text-slate-400" />
            </div>
          </div>
          <p className="text-slate-600 font-semibold">No training sessions yet</p>
          <p className="text-slate-400 text-sm mt-1">Track your training sessions to keep a record of your team's development.</p>
          <Button className="mt-4" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Plan First Session
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map(session => (
            <Card key={session.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-900">{session.title}</h3>
                    <Badge variant={SESSION_TYPE_COLORS[session.type] as 'info' | 'success' | 'danger' | 'warning' | 'neutral'}>
                      {SESSION_TYPE_LABELS[session.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <ClipboardList size={12} />
                      {format(parseISO(session.date), 'EEE, d MMM yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {session.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {session.location}
                    </span>
                  </div>
                  {session.description && (
                    <p className="text-slate-600 text-sm mt-2">{session.description}</p>
                  )}
                  {session.objectives.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {session.objectives.map((obj, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Session Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Plan Training Session" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Session Title *</label>
              <input {...register('title')} className={inputClass} placeholder="e.g. Defensive Shape" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" {...register('date')} className={inputClass} />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Duration (minutes)</label>
              <input type="number" {...register('duration_minutes')} className={inputClass} min={15} max={300} />
              {errors.duration_minutes && <p className="text-xs text-red-500 mt-1">{errors.duration_minutes.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Location *</label>
              <input {...register('location')} className={inputClass} placeholder="Training ground" />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Session Type</label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select {...field} className={inputClass}>
                    <option value="technical">Technical</option>
                    <option value="tactical">Tactical</option>
                    <option value="physical">Physical</option>
                    <option value="recovery">Recovery</option>
                    <option value="set_pieces">Set Pieces</option>
                    <option value="scrimmage">Scrimmage</option>
                    <option value="mixed">Mixed</option>
                  </select>
                )}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea {...register('description')} rows={2} className={inputClass} placeholder="Session overview..." />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Objectives (one per line)</label>
              <textarea
                {...register('objectives')}
                rows={3}
                className={inputClass}
                placeholder="Improve pressing triggers&#10;Work on build-up play&#10;Set piece practice"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit">Add Session</Button>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
