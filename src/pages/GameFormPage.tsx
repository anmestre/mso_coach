import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const gameSchema = z.object({
  type: z.enum(['friendly', 'championship', 'cup']),
  competition_name: z.string().optional(),
  round: z.string().optional(),
  opponent_id: z.string().min(1, 'Opponent is required'),
  home_away: z.enum(['home', 'away', 'neutral']),
  date: z.string().min(1, 'Date is required'),
  venue: z.string().min(1, 'Venue is required'),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'postponed']),
  score_us: z.coerce.number().int().min(0).optional().or(z.literal('')),
  score_them: z.coerce.number().int().min(0).optional().or(z.literal('')),
  notes: z.string().optional(),
})

type GameFormData = z.infer<typeof gameSchema>

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
const errorClass = 'text-xs text-red-500 mt-1'

export function GameFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, opponents, addGame, updateGame, currentSeason } = useAppStore()
  const isEdit = Boolean(id) && id !== 'new'
  const existing = isEdit ? games.find(g => g.id === id) : undefined

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GameFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(gameSchema) as any,
    defaultValues: {
      type: 'championship',
      competition_name: '',
      round: '',
      opponent_id: '',
      home_away: 'home',
      date: new Date().toISOString().split('T')[0],
      venue: 'Campo Municipal',
      status: 'scheduled',
      score_us: undefined,
      score_them: undefined,
      notes: '',
    },
  })

  const watchStatus = watch('status')

  useEffect(() => {
    if (existing) {
      reset({
        type: existing.type,
        competition_name: existing.competition_name ?? '',
        round: existing.round ?? '',
        opponent_id: existing.opponent_id,
        home_away: existing.home_away,
        date: existing.date.split('T')[0],
        venue: existing.venue,
        status: existing.status,
        score_us: existing.score_us,
        score_them: existing.score_them,
        notes: existing.notes ?? '',
      })
    }
  }, [existing, reset])

  const onSubmit: SubmitHandler<GameFormData> = (data) => {
    const scoreUs = data.score_us !== '' && data.score_us !== undefined ? Number(data.score_us) : undefined
    const scoreThem = data.score_them !== '' && data.score_them !== undefined ? Number(data.score_them) : undefined

    let result: 'win' | 'draw' | 'loss' | undefined
    if (data.status === 'completed' && scoreUs !== undefined && scoreThem !== undefined) {
      result = scoreUs > scoreThem ? 'win' : scoreUs < scoreThem ? 'loss' : 'draw'
    }

    const payload = {
      season_id: currentSeason.id,
      type: data.type,
      competition_name: data.competition_name || undefined,
      round: data.round || undefined,
      opponent_id: data.opponent_id,
      home_away: data.home_away,
      date: new Date(data.date).toISOString(),
      venue: data.venue,
      status: data.status,
      score_us: scoreUs,
      score_them: scoreThem,
      result,
      notes: data.notes || undefined,
    }

    if (isEdit && id) {
      updateGame(id, payload)
      toast.success('Game updated!')
      navigate(`/games/${id}`)
    } else {
      addGame(payload)
      toast.success('Game added!')
      navigate('/calendar')
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <button
        onClick={() => navigate(isEdit ? `/games/${id}` : '/calendar')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        {isEdit ? 'Back to Game' : 'Back to Calendar'}
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Game' : 'Add New Game'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Game Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Game Type</label>
              <select {...register('type')} className={inputClass}>
                <option value="championship">Championship</option>
                <option value="cup">Cup</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Competition</label>
              <input {...register('competition_name')} className={inputClass} placeholder="Liga Distrital" />
            </div>
            <div>
              <label className={labelClass}>Round / Stage</label>
              <input {...register('round')} className={inputClass} placeholder="Jornada 1" />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select {...register('status')} className={inputClass}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Opponent & Venue</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Opponent *</label>
              <select {...register('opponent_id')} className={inputClass}>
                <option value="">Select opponent</option>
                {opponents.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              {errors.opponent_id && <p className={errorClass}>{errors.opponent_id.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Home / Away</label>
              <select {...register('home_away')} className={inputClass}>
                <option value="home">Home</option>
                <option value="away">Away</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" {...register('date')} className={inputClass} />
              {errors.date && <p className={errorClass}>{errors.date.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Venue *</label>
              <input {...register('venue')} className={inputClass} placeholder="Campo Municipal" />
              {errors.venue && <p className={errorClass}>{errors.venue.message}</p>}
            </div>
          </div>
        </Card>

        {watchStatus === 'completed' && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Score</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className={labelClass}>Our Score</label>
                <input
                  type="number"
                  min={0}
                  {...register('score_us')}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div className="text-slate-400 font-bold text-2xl mt-5">–</div>
              <div className="flex-1">
                <label className={labelClass}>Their Score</label>
                <input
                  type="number"
                  min={0}
                  {...register('score_them')}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <label className={labelClass}>Notes</label>
          <textarea {...register('notes')} rows={3} className={inputClass} placeholder="Any additional notes..." />
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save size={16} />
            {isEdit ? 'Save Changes' : 'Add Game'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(isEdit ? `/games/${id}` : '/calendar')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
