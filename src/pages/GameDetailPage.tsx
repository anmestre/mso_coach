import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Edit, Swords, Trash2, MapPin, Calendar, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '../stores/useAppStore'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { GAME_TYPE_COLORS } from '../lib/constants'
import type { GameStatus } from '../types'

const statusVariant: Record<GameStatus, 'success' | 'neutral' | 'warning' | 'danger'> = {
  completed: 'success',
  scheduled: 'info' as never,
  cancelled: 'danger',
  postponed: 'warning',
}

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, matchDayRecords, deleteGame } = useAppStore()

  const game = games.find(g => g.id === id)
  const matchRecord = matchDayRecords.find(r => r.game_id === id)

  if (!game) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg font-medium">Game not found</p>
        <button onClick={() => navigate('/calendar')} className="mt-3 text-green-600 hover:underline text-sm">
          Back to Calendar
        </button>
      </div>
    )
  }

  function handleDelete() {
    if (!game) return
    if (confirm('Delete this game? This cannot be undone.')) {
      deleteGame(game.id)
      toast.success('Game deleted')
      navigate('/calendar')
    }
  }

  const resultColors: Record<string, string> = {
    win: 'text-green-600',
    draw: 'text-slate-500',
    loss: 'text-red-600',
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/calendar')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to Calendar
      </button>

      {/* Header */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div
                className="text-xs px-2 py-0.5 rounded font-semibold text-white"
                style={{ backgroundColor: GAME_TYPE_COLORS[game.type] }}
              >
                {game.type.charAt(0).toUpperCase() + game.type.slice(1)}
              </div>
              <Badge variant={statusVariant[game.status] ?? 'neutral'}>
                {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
              </Badge>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">
                {game.home_away}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              vs {game.opponent?.name ?? 'TBC'}
            </h1>
            {game.competition_name && (
              <p className="text-slate-500 text-sm mt-0.5">
                {game.competition_name}{game.round ? ` · ${game.round}` : ''}
              </p>
            )}
          </div>

          {game.status === 'completed' && (
            <div className="text-center">
              <p className={`text-5xl font-black ${game.result ? resultColors[game.result] : 'text-slate-800'}`}>
                {game.score_us} – {game.score_them}
              </p>
              {game.result && (
                <p className={`text-sm font-semibold uppercase tracking-wide mt-1 ${resultColors[game.result]}`}>
                  {game.result}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            {format(parseISO(game.date), 'EEEE, d MMMM yyyy')}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={14} className="text-slate-400" />
            {game.venue}
          </div>
          {game.opponent?.home_ground && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Trophy size={14} className="text-slate-400" />
              {game.opponent.home_ground}
            </div>
          )}
        </div>
      </Card>

      {/* Match record summary */}
      {matchRecord && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Match Record</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-slate-600">Formation:</span>
            <span className="font-semibold text-slate-800">{matchRecord.formation}</span>
          </div>
          <div className="space-y-1">
            {matchRecord.events
              .sort((a, b) => a.minute - b.minute)
              .map(event => (
                <div key={event.id} className="flex items-center gap-3 text-sm py-1">
                  <span className="text-slate-400 w-8 text-right font-mono">{event.minute}'</span>
                  <span className={
                    event.type === 'goal' || event.type === 'penalty_scored' ? 'text-green-600' :
                    event.type === 'yellow_card' ? 'text-amber-500' :
                    event.type === 'red_card' ? 'text-red-600' :
                    event.type === 'substitution' ? 'text-blue-500' :
                    'text-slate-500'
                  }>
                    {event.type === 'goal' ? '⚽' :
                     event.type === 'yellow_card' ? '🟨' :
                     event.type === 'red_card' ? '🟥' :
                     event.type === 'substitution' ? '↔' :
                     event.type === 'own_goal' ? '⚽ OG' :
                     event.type === 'penalty_scored' ? '⚽ PEN' : '•'}
                  </span>
                  <span className="text-slate-700">
                    {event.player?.first_name} {event.player?.last_name}
                    {event.assist_player && (
                      <span className="text-slate-400 ml-1">(assist: {event.assist_player.first_name})</span>
                    )}
                    {event.player_off && (
                      <span className="text-slate-400 ml-1">↓ {event.player_off.first_name} {event.player_off.last_name}</span>
                    )}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate(`/games/${id}/matchday`)}>
          <Swords size={16} />
          {matchRecord ? 'View Match Day' : 'Prepare Match Day'}
        </Button>
        <Button variant="ghost" onClick={() => navigate(`/games/${id}/edit`)}>
          <Edit size={14} />
          Edit Game
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          <Trash2 size={14} />
          Delete
        </Button>
      </div>
    </div>
  )
}
