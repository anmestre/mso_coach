import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO, differenceInYears } from 'date-fns'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '../stores/useAppStore'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { POSITION_LABELS } from '../lib/constants'
import type { SquadStatus } from '../types'

const statusVariant: Record<SquadStatus, 'success' | 'danger' | 'warning' | 'neutral'> = {
  active: 'success',
  injured: 'danger',
  suspended: 'warning',
  inactive: 'neutral',
}

export function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { players, matchDayRecords, deletePlayer } = useAppStore()

  const player = players.find(p => p.id === id)

  if (!player) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg font-medium">Player not found</p>
        <button onClick={() => navigate('/squad')} className="mt-3 text-green-600 hover:underline text-sm">
          Back to Squad
        </button>
      </div>
    )
  }

  const allEvents = matchDayRecords.flatMap(r => r.events)
  const appearances = matchDayRecords.filter(r =>
    r.starting_xi.some(s => s.player_id === id) || r.substitutes.some(s => s.player_id === id)
  ).length
  const goals = allEvents.filter(e => e.player_id === id && (e.type === 'goal' || e.type === 'penalty_scored')).length
  const ownGoals = allEvents.filter(e => e.player_id === id && e.type === 'own_goal').length
  const assists = allEvents.filter(e => e.assist_player_id === id).length
  const yellowCards = allEvents.filter(e => e.player_id === id && e.type === 'yellow_card').length
  const redCards = allEvents.filter(e => e.player_id === id && e.type === 'red_card').length

  const age = differenceInYears(new Date(), parseISO(player.date_of_birth))
  const fullName = `${player.first_name} ${player.last_name}`
  const initials = `${player.first_name[0]}${player.last_name[0]}`

  function handleDelete() {
    if (!player) return
    if (confirm(`Delete ${fullName}? This cannot be undone.`)) {
      deletePlayer(player.id)
      toast.success('Player deleted')
      navigate('/squad')
    }
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/squad')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Squad
      </button>

      {/* Header card */}
      <Card className="p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
            style={{ backgroundColor: '#0d1529' }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              {player.jersey_number && (
                <span className="text-2xl font-bold text-amber-500">#{player.jersey_number}</span>
              )}
              <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
              {player.nickname && (
                <span className="text-slate-400 italic">"{player.nickname}"</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm font-medium">
                {POSITION_LABELS[player.primary_position] ?? player.primary_position}
              </span>
              {player.secondary_positions.map(pos => (
                <span key={pos} className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded text-xs border border-slate-200">
                  {pos}
                </span>
              ))}
              <Badge variant={statusVariant[player.squad_status]}>
                {player.squad_status.charAt(0).toUpperCase() + player.squad_status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/squad/${id}/edit`)}>
              <Edit size={14} />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Personal Info</h3>
          <dl className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Date of Birth</dt>
              <dd className="font-medium text-slate-800">
                {format(parseISO(player.date_of_birth), 'd MMM yyyy')}
                <span className="text-slate-400 ml-1">({age}y)</span>
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Preferred Foot</dt>
              <dd className="font-medium text-slate-800 capitalize">{player.preferred_foot}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Joined</dt>
              <dd className="font-medium text-slate-800">{format(parseISO(player.join_date), 'd MMM yyyy')}</dd>
            </div>
            {player.phone && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium text-slate-800">{player.phone}</dd>
              </div>
            )}
            {player.email && (
              <div className="flex justify-between text-sm">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-800 truncate max-w-[160px]">{player.email}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Season Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-slate-50 rounded-lg p-2">
              <p className="text-2xl font-bold text-slate-900">{appearances}</p>
              <p className="text-xs text-slate-500">Apps</p>
            </div>
            <div className="text-center bg-green-50 rounded-lg p-2">
              <p className="text-2xl font-bold text-green-600">{goals}</p>
              <p className="text-xs text-slate-500">Goals</p>
            </div>
            <div className="text-center bg-blue-50 rounded-lg p-2">
              <p className="text-2xl font-bold text-blue-600">{assists}</p>
              <p className="text-xs text-slate-500">Assists</p>
            </div>
            <div className="text-center bg-amber-50 rounded-lg p-2">
              <p className="text-2xl font-bold text-amber-500">{yellowCards}</p>
              <p className="text-xs text-slate-500">Yellow</p>
            </div>
            <div className="text-center bg-red-50 rounded-lg p-2">
              <p className="text-2xl font-bold text-red-600">{redCards}</p>
              <p className="text-xs text-slate-500">Red</p>
            </div>
            <div className="text-center bg-slate-50 rounded-lg p-2">
              <p className="text-2xl font-bold text-slate-400">{ownGoals}</p>
              <p className="text-xs text-slate-500">OG</p>
            </div>
          </div>
        </Card>
      </div>

      {player.notes && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Notes</h3>
          <p className="text-slate-700 text-sm whitespace-pre-wrap">{player.notes}</p>
        </Card>
      )}
    </div>
  )
}
