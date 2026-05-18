import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAppStore } from '../stores/useAppStore'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

const opponentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  short_name: z.string().optional(),
  home_ground: z.string().optional(),
  usual_formation: z.string().optional(),
  notes: z.string().optional(),
})
type OpponentForm = z.infer<typeof opponentSchema>

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

export function OpponentsPage() {
  const { opponents, games, addOpponent } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OpponentForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(opponentSchema) as any,
  })

  const onSubmit: SubmitHandler<OpponentForm> = (data) => {
    addOpponent({
      name: data.name,
      short_name: data.short_name || undefined,
      home_ground: data.home_ground || undefined,
      usual_formation: data.usual_formation || undefined,
      notes: data.notes || undefined,
    })
    toast.success('Opponent added!')
    reset()
    setShowModal(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Opponents</h1>
          <p className="text-slate-500 text-sm mt-0.5">{opponents.length} opponents tracked</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Opponent
        </Button>
      </div>

      <div className="space-y-3">
        {opponents.map(opponent => {
          const opponentGames = games.filter(g => g.opponent_id === opponent.id && g.status === 'completed')
          const wins = opponentGames.filter(g => g.result === 'win').length
          const draws = opponentGames.filter(g => g.result === 'draw').length
          const losses = opponentGames.filter(g => g.result === 'loss').length
          const isExpanded = expanded === opponent.id

          return (
            <Card key={opponent.id} className="overflow-hidden">
              <div
                className="p-4 cursor-pointer flex items-center gap-4"
                onClick={() => setExpanded(isExpanded ? null : opponent.id)}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: '#0d1529' }}>
                  {opponent.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{opponent.name}</p>
                  {opponent.home_ground && (
                    <p className="text-xs text-slate-400 truncate">{opponent.home_ground}</p>
                  )}
                </div>

                {/* W/D/L */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600">{wins}W</span>
                    <span className="text-sm font-bold text-slate-500">{draws}D</span>
                    <span className="text-sm font-bold text-red-500">{losses}L</span>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
                  {opponent.usual_formation && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Usual Formation:</span>
                      <Badge variant="info">{opponent.usual_formation}</Badge>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Match History</p>
                    {opponentGames.length === 0 ? (
                      <p className="text-slate-400 text-sm">No completed games yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {opponentGames
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(game => (
                            <div key={game.id} className="flex items-center gap-3 bg-white rounded-lg p-2 border border-slate-100">
                              <Badge
                                variant={
                                  game.result === 'win' ? 'success' :
                                  game.result === 'loss' ? 'danger' : 'neutral'
                                }
                              >
                                {game.result?.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-bold text-slate-700">
                                {game.score_us} – {game.score_them}
                              </span>
                              <span className="text-xs text-slate-400 capitalize">{game.home_away}</span>
                              <span className="text-xs text-slate-400 ml-auto">
                                {format(parseISO(game.date), 'd MMM yy')}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {opponent.notes && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-slate-600">{opponent.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}

        {opponents.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p>No opponents yet.</p>
          </div>
        )}
      </div>

      {/* Add Opponent Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Opponent">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input {...register('name')} className={inputClass} placeholder="Club name" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Short Name</label>
            <input {...register('short_name')} className={inputClass} placeholder="Abbreviation" />
          </div>
          <div>
            <label className={labelClass}>Home Ground</label>
            <input {...register('home_ground')} className={inputClass} placeholder="Stadium name" />
          </div>
          <div>
            <label className={labelClass}>Usual Formation</label>
            <input {...register('usual_formation')} className={inputClass} placeholder="e.g. 4-3-3" />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea {...register('notes')} rows={2} className={inputClass} />
          </div>
          <div className="flex gap-3">
            <Button type="submit">Add Opponent</Button>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
