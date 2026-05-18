import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAppStore } from '../stores/useAppStore'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { POSITION_LABELS } from '../lib/constants'

interface PlayerStat {
  id: string
  name: string
  position: string
  apps: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
}

export function StatsPage() {
  const navigate = useNavigate()
  const { players, games, matchDayRecords } = useAppStore()

  const allEvents = matchDayRecords.flatMap(r => r.events)

  const playerStats: PlayerStat[] = players.map(player => {
    const apps = matchDayRecords.filter(r =>
      r.starting_xi.some(s => s.player_id === player.id) ||
      r.substitutes.some(s => s.player_id === player.id)
    ).length
    const goals = allEvents.filter(e =>
      e.player_id === player.id && (e.type === 'goal' || e.type === 'penalty_scored')
    ).length
    const assists = allEvents.filter(e => e.assist_player_id === player.id).length
    const yellowCards = allEvents.filter(e => e.player_id === player.id && e.type === 'yellow_card').length
    const redCards = allEvents.filter(e => e.player_id === player.id && e.type === 'red_card').length
    return {
      id: player.id,
      name: `${player.first_name} ${player.last_name}`,
      position: POSITION_LABELS[player.primary_position] ?? player.primary_position,
      apps,
      goals,
      assists,
      yellowCards,
      redCards,
    }
  }).sort((a, b) => b.goals - a.goals || b.apps - a.apps)

  const completedGames = games.filter(g => g.status === 'completed')
  const wins = completedGames.filter(g => g.result === 'win').length
  const draws = completedGames.filter(g => g.result === 'draw').length
  const losses = completedGames.filter(g => g.result === 'loss').length
  const goalsScored = completedGames.reduce((acc, g) => acc + (g.score_us ?? 0), 0)
  const goalsConceded = completedGames.reduce((acc, g) => acc + (g.score_them ?? 0), 0)

  // Goals per game chart data
  const chartData = completedGames
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(g => ({
      name: `vs ${g.opponent?.short_name ?? g.opponent?.name ?? 'TBC'}`,
      date: format(parseISO(g.date), 'dd/MM'),
      scored: g.score_us ?? 0,
      conceded: g.score_them ?? 0,
    }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statistics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Season overview</p>
      </div>

      {/* Season record */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-green-600">{wins}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Wins</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-slate-500">{draws}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Draws</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-red-500">{losses}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Losses</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-slate-900">{completedGames.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Played</p>
        </Card>
      </div>

      {/* Goals */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-green-600">{goalsScored}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Goals Scored</p>
          {completedGames.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              {(goalsScored / completedGames.length).toFixed(1)} per game
            </p>
          )}
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-black text-red-500">{goalsConceded}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Goals Conceded</p>
          {completedGames.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              {(goalsConceded / completedGames.length).toFixed(1)} per game
            </p>
          )}
        </Card>
      </div>

      {/* Goals chart */}
      {chartData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-slate-700 mb-4">Goals Per Game</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                angle={-45}
                textAnchor="end"
                height={40}
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                formatter={(val, name) => [val, name === 'scored' ? 'Scored' : 'Conceded']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="scored" fill="#16a34a" radius={[3, 3, 0, 0]} name="scored" />
              <Bar dataKey="conceded" fill="#ef4444" radius={[3, 3, 0, 0]} name="conceded" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 justify-center mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-600" />
              <span className="text-xs text-slate-500">Scored</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-xs text-slate-500">Conceded</span>
            </div>
          </div>
        </Card>
      )}

      {/* Player stats table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Player Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-2.5 font-semibold">Player</th>
                <th className="text-left px-3 py-2.5 font-semibold hidden sm:table-cell">Position</th>
                <th className="text-center px-3 py-2.5 font-semibold">Apps</th>
                <th className="text-center px-3 py-2.5 font-semibold">Goals</th>
                <th className="text-center px-3 py-2.5 font-semibold">Assists</th>
                <th className="text-center px-3 py-2.5 font-semibold hidden sm:table-cell">
                  <span className="text-amber-500">Y</span>
                </th>
                <th className="text-center px-3 py-2.5 font-semibold hidden sm:table-cell">
                  <span className="text-red-500">R</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {playerStats.map((stat, i) => (
                <tr
                  key={stat.id}
                  className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/squad/${stat.id}`)}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                      <span className="font-medium text-slate-800">{stat.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 hidden sm:table-cell">
                    <span className="text-xs text-slate-500">{stat.position}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-700 font-medium">{stat.apps}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`font-bold ${stat.goals > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                      {stat.goals}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`font-medium ${stat.assists > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                      {stat.assists}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center hidden sm:table-cell">
                    <span className={`font-medium ${stat.yellowCards > 0 ? 'text-amber-500' : 'text-slate-300'}`}>
                      {stat.yellowCards}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center hidden sm:table-cell">
                    <span className={`font-medium ${stat.redCards > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                      {stat.redCards}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {playerStats.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">No player stats yet.</div>
        )}
      </Card>

      {/* Results list */}
      {completedGames.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Results</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {completedGames
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(game => (
                <div
                  key={game.id}
                  onClick={() => navigate(`/games/${game.id}`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer"
                >
                  <Badge
                    variant={
                      game.result === 'win' ? 'success' :
                      game.result === 'loss' ? 'danger' : 'neutral'
                    }
                  >
                    {game.result?.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-slate-700 flex-1">
                    vs {game.opponent?.name}
                  </span>
                  <span className="font-bold text-slate-800">
                    {game.score_us} – {game.score_them}
                  </span>
                  <span className="text-xs text-slate-400 w-16 text-right">
                    {format(parseISO(game.date), 'd MMM')}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}
