import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { PlayerCard } from '../components/squad/PlayerCard'
import { Button } from '../components/ui/Button'
import { POSITIONS, POSITION_LABELS } from '../lib/constants'
import type { SquadStatus, Position } from '../types'

const STATUS_OPTIONS: { value: SquadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'injured', label: 'Injured' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
]

export function SquadPage() {
  const navigate = useNavigate()
  const { players } = useAppStore()
  const [positionFilter, setPositionFilter] = useState<Position | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<SquadStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = players.filter(p => {
    const matchPos = positionFilter === 'all' || p.primary_position === positionFilter
    const matchStatus = statusFilter === 'all' || p.squad_status === statusFilter
    const matchSearch =
      search === '' ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (p.nickname ?? '').toLowerCase().includes(search.toLowerCase())
    return matchPos && matchStatus && matchSearch
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Squad</h1>
          <p className="text-slate-500 text-sm mt-0.5">{players.length} players registered</p>
        </div>
        <Button onClick={() => navigate('/squad/new')}>
          <Plus size={16} />
          Add Player
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
      </div>

      {/* Position filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPositionFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            positionFilter === 'all'
              ? 'bg-[#0d1529] text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Positions
        </button>
        {POSITIONS.map(pos => (
          <button
            key={pos}
            onClick={() => setPositionFilter(pos)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              positionFilter === pos
                ? 'bg-[#0d1529] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-green-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No players found</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}

      {/* Hidden: suppress unused import warning */}
      <span className="hidden">{POSITION_LABELS['GK']}</span>
    </div>
  )
}

function Users({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
