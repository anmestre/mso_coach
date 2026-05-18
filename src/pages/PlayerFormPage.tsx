import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { POSITIONS, POSITION_LABELS } from '../lib/constants'
import type { Position } from '../types'

const playerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  nickname: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  primary_position: z.string().min(1, 'Position is required'),
  secondary_positions: z.array(z.string()).default([]),
  preferred_foot: z.enum(['left', 'right', 'both']),
  jersey_number: z.coerce.number().int().min(1).max(99).optional().or(z.literal('')),
  squad_status: z.enum(['active', 'injured', 'suspended', 'inactive']),
  join_date: z.string().min(1, 'Join date is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
})

type PlayerFormData = z.infer<typeof playerSchema>

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
const errorClass = 'text-xs text-red-500 mt-1'

export function PlayerFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { players, addPlayer, updatePlayer } = useAppStore()
  const isEdit = Boolean(id)
  const existing = isEdit ? players.find(p => p.id === id) : undefined

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlayerFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(playerSchema) as any,
    defaultValues: {
      first_name: '',
      last_name: '',
      nickname: '',
      date_of_birth: '',
      primary_position: 'GK',
      secondary_positions: [],
      preferred_foot: 'right',
      jersey_number: undefined,
      squad_status: 'active',
      join_date: new Date().toISOString().split('T')[0],
      phone: '',
      email: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        first_name: existing.first_name,
        last_name: existing.last_name,
        nickname: existing.nickname ?? '',
        date_of_birth: existing.date_of_birth,
        primary_position: existing.primary_position,
        secondary_positions: existing.secondary_positions,
        preferred_foot: existing.preferred_foot,
        jersey_number: existing.jersey_number,
        squad_status: existing.squad_status,
        join_date: existing.join_date,
        phone: existing.phone ?? '',
        email: existing.email ?? '',
        notes: existing.notes ?? '',
      })
    }
  }, [existing, reset])

  const onSubmit: SubmitHandler<PlayerFormData> = (data) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      nickname: data.nickname || undefined,
      date_of_birth: data.date_of_birth,
      primary_position: data.primary_position as Position,
      secondary_positions: (data.secondary_positions ?? []) as Position[],
      preferred_foot: data.preferred_foot,
      jersey_number: data.jersey_number ? Number(data.jersey_number) : undefined,
      squad_status: data.squad_status,
      join_date: data.join_date,
      phone: data.phone || undefined,
      email: data.email || undefined,
      notes: data.notes || undefined,
    }

    if (isEdit && id) {
      updatePlayer(id, payload)
      toast.success('Player updated!')
      navigate(`/squad/${id}`)
    } else {
      addPlayer(payload)
      toast.success('Player added!')
      navigate('/squad')
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <button
        onClick={() => navigate(isEdit ? `/squad/${id}` : '/squad')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        {isEdit ? 'Back to Profile' : 'Back to Squad'}
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Player' : 'Add New Player'}</h1>
        <p className="text-slate-500 text-sm mt-0.5">Fill in the player's information below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic info */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input {...register('first_name')} className={inputClass} placeholder="João" />
              {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input {...register('last_name')} className={inputClass} placeholder="Silva" />
              {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Nickname</label>
              <input {...register('nickname')} className={inputClass} placeholder="Optional" />
            </div>
            <div>
              <label className={labelClass}>Jersey Number</label>
              <input
                type="number"
                {...register('jersey_number')}
                className={inputClass}
                placeholder="e.g. 9"
                min={1}
                max={99}
              />
              {errors.jersey_number && <p className={errorClass}>{errors.jersey_number.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Date of Birth *</label>
              <input type="date" {...register('date_of_birth')} className={inputClass} />
              {errors.date_of_birth && <p className={errorClass}>{errors.date_of_birth.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Preferred Foot</label>
              <select {...register('preferred_foot')} className={inputClass}>
                <option value="right">Right</option>
                <option value="left">Left</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Position */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Position</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Primary Position *</label>
              <select {...register('primary_position')} className={inputClass}>
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos} – {POSITION_LABELS[pos]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Secondary Positions</label>
              <Controller
                name="secondary_positions"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5">
                    {POSITIONS.map(pos => {
                      const selected = field.value?.includes(pos)
                      return (
                        <button
                          type="button"
                          key={pos}
                          onClick={() => {
                            if (selected) {
                              field.onChange(field.value?.filter((p: string) => p !== pos) ?? [])
                            } else {
                              field.onChange([...(field.value ?? []), pos])
                            }
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                            selected
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'
                          }`}
                        >
                          {pos}
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Status & dates */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Status & Dates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Squad Status</label>
              <select {...register('squad_status')} className={inputClass}>
                <option value="active">Active</option>
                <option value="injured">Injured</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Join Date *</label>
              <input type="date" {...register('join_date')} className={inputClass} />
              {errors.join_date && <p className={errorClass}>{errors.join_date.message}</p>}
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input {...register('phone')} className={inputClass} placeholder="+351 912 345 678" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" {...register('email')} className={inputClass} placeholder="player@email.com" />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Notes</h3>
          <textarea
            {...register('notes')}
            rows={3}
            className={inputClass}
            placeholder="Any additional notes about this player..."
          />
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save size={16} />
            {isEdit ? 'Save Changes' : 'Add Player'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(isEdit ? `/squad/${id}` : '/squad')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
