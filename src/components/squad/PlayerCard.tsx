import { useNavigate } from 'react-router-dom'
import type { Player } from '../../types'
import { POSITION_LABELS } from '../../lib/constants'
import { Badge } from '../ui/Badge'

interface PlayerCardProps {
  player: Player
}

const statusVariant: Record<string, 'success' | 'danger' | 'warning' | 'neutral'> = {
  active: 'success',
  injured: 'danger',
  suspended: 'warning',
  inactive: 'neutral',
}

export function PlayerCard({ player }: PlayerCardProps) {
  const navigate = useNavigate()
  const fullName = `${player.first_name} ${player.last_name}`
  const initials = `${player.first_name[0]}${player.last_name[0]}`

  return (
    <div
      onClick={() => navigate(`/squad/${player.id}`)}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-md transition-shadow flex items-start gap-3"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: '#0d1529' }}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {player.jersey_number && (
            <span className="text-xs font-bold text-amber-600">#{player.jersey_number}</span>
          )}
          <span className="font-semibold text-slate-900 truncate">{fullName}</span>
          {player.nickname && (
            <span className="text-xs text-slate-400 italic">"{player.nickname}"</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
            {POSITION_LABELS[player.primary_position] ?? player.primary_position}
          </span>
          <Badge variant={statusVariant[player.squad_status]}>
            {player.squad_status.charAt(0).toUpperCase() + player.squad_status.slice(1)}
          </Badge>
        </div>
      </div>
    </div>
  )
}
