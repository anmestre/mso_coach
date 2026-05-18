import { useNavigate } from 'react-router-dom'
import { format, differenceInDays, parseISO } from 'date-fns'
import { CalendarDays, TrendingUp, Users, ChevronRight, Plus, ClipboardList, Swords } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GAME_TYPE_COLORS } from '../lib/constants'

function ResultBadge({ result }: { result?: string }) {
  if (!result) return null
  const map: Record<string, 'success' | 'neutral' | 'danger'> = {
    win: 'success',
    draw: 'neutral',
    loss: 'danger',
  }
  return (
    <Badge variant={map[result] ?? 'neutral'} className="uppercase text-xs tracking-wide">
      {result}
    </Badge>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { games, players, currentSeason } = useAppStore()

  const now = new Date()

  const upcomingGames = games
    .filter(g => g.status === 'scheduled' && parseISO(g.date) >= now)
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())

  const nextGame = upcomingGames[0]

  const completedGames = games
    .filter(g => g.status === 'completed')
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

  const lastGame = completedGames[0]

  const wins = completedGames.filter(g => g.result === 'win').length
  const draws = completedGames.filter(g => g.result === 'draw').length
  const losses = completedGames.filter(g => g.result === 'loss').length

  const squadByStatus = {
    active: players.filter(p => p.squad_status === 'active').length,
    injured: players.filter(p => p.squad_status === 'injured').length,
    suspended: players.filter(p => p.squad_status === 'suspended').length,
    inactive: players.filter(p => p.squad_status === 'inactive').length,
  }

  const daysUntilNext = nextGame
    ? differenceInDays(parseISO(nextGame.date), now)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Season {currentSeason.name}</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Next game */}
        <Card className="p-4 col-span-1 sm:col-span-2">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <CalendarDays size={16} />
              Next Game
            </div>
            {nextGame && (
              <div
                className="text-xs px-2 py-0.5 rounded font-semibold text-white"
                style={{ backgroundColor: GAME_TYPE_COLORS[nextGame.type] }}
              >
                {nextGame.type.charAt(0).toUpperCase() + nextGame.type.slice(1)}
              </div>
            )}
          </div>
          {nextGame ? (
            <div>
              <p className="text-xl font-bold text-slate-900">
                vs {nextGame.opponent?.name ?? 'TBC'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {format(parseISO(nextGame.date), 'EEE, d MMM yyyy')} · {nextGame.venue}
              </p>
              <p className="text-slate-400 text-sm">{nextGame.home_away === 'home' ? 'Home' : nextGame.home_away === 'away' ? 'Away' : 'Neutral'}</p>
              <div className="mt-3 flex items-center gap-2">
                {daysUntilNext === 0 ? (
                  <span className="text-green-600 font-bold text-sm">Today!</span>
                ) : (
                  <span className="text-amber-600 font-semibold text-sm">
                    {daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''} away
                  </span>
                )}
                <button
                  onClick={() => navigate(`/games/${nextGame.id}`)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  View <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No upcoming games scheduled.</p>
          )}
        </Card>

        {/* Last result */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
            <TrendingUp size={16} />
            Last Result
          </div>
          {lastGame ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ResultBadge result={lastGame.result} />
              </div>
              <p className="font-semibold text-slate-900 text-sm">vs {lastGame.opponent?.name}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {lastGame.score_us} – {lastGame.score_them}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {format(parseISO(lastGame.date), 'd MMM')}
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No results yet.</p>
          )}
        </Card>

        {/* Season record */}
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
            <TrendingUp size={16} />
            Season Record
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{wins}</p>
              <p className="text-xs text-slate-500">W</p>
            </div>
            <div className="text-slate-300 text-xl">·</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-500">{draws}</p>
              <p className="text-xs text-slate-500">D</p>
            </div>
            <div className="text-slate-300 text-xl">·</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{losses}</p>
              <p className="text-xs text-slate-500">L</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">{completedGames.length} played</p>
        </Card>
      </div>

      {/* Squad availability + upcoming fixtures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Squad availability */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Users size={16} />
              Squad Availability
            </div>
            <button
              onClick={() => navigate('/squad')}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{squadByStatus.active}</p>
              <p className="text-xs text-green-600 font-medium">Available</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{squadByStatus.injured}</p>
              <p className="text-xs text-red-500 font-medium">Injured</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{squadByStatus.suspended}</p>
              <p className="text-xs text-amber-600 font-medium">Suspended</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-slate-500">{squadByStatus.inactive}</p>
              <p className="text-xs text-slate-400 font-medium">Inactive</p>
            </div>
          </div>
        </Card>

        {/* Upcoming fixtures */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <CalendarDays size={16} />
              Upcoming Fixtures
            </div>
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              Calendar <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingGames.slice(0, 3).map(game => (
              <div
                key={game.id}
                onClick={() => navigate(`/games/${game.id}`)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: GAME_TYPE_COLORS[game.type] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">vs {game.opponent?.name}</p>
                  <p className="text-xs text-slate-400">
                    {format(parseISO(game.date), 'EEE d MMM')} · {game.home_away === 'home' ? 'H' : game.home_away === 'away' ? 'A' : 'N'}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
              </div>
            ))}
            {upcomingGames.length === 0 && (
              <p className="text-slate-400 text-sm py-2">No upcoming fixtures.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-4">
        <h3 className="text-slate-700 font-semibold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/training')}
          >
            <ClipboardList size={16} />
            Plan Training
          </Button>
          {nextGame && (
            <Button
              variant="primary"
              onClick={() => navigate(`/games/${nextGame.id}/matchday`)}
            >
              <Swords size={16} />
              Prepare Match
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => navigate('/calendar/new')}
          >
            <Plus size={16} />
            Add Game
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/squad/new')}
          >
            <Plus size={16} />
            Add Player
          </Button>
        </div>
      </Card>
    </div>
  )
}
