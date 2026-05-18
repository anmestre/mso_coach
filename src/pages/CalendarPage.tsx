import { useNavigate } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Plus } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { Button } from '../components/ui/Button'
import { GAME_TYPE_COLORS } from '../lib/constants'

export function CalendarPage() {
  const navigate = useNavigate()
  const { games } = useAppStore()

  const events = games.map(game => ({
    id: game.id,
    title: `${game.home_away === 'home' ? 'vs' : '@'} ${game.opponent?.name ?? 'TBC'}`,
    date: game.date.split('T')[0],
    backgroundColor: GAME_TYPE_COLORS[game.type],
    borderColor: GAME_TYPE_COLORS[game.type],
    textColor: '#fff',
    extendedProps: { game },
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Fixtures & schedule</p>
        </div>
        <Button onClick={() => navigate('/calendar/new')}>
          <Plus size={16} />
          New Game
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GAME_TYPE_COLORS.championship }} />
          <span className="text-xs text-slate-600">Championship</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GAME_TYPE_COLORS.cup }} />
          <span className="text-xs text-slate-600">Cup</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GAME_TYPE_COLORS.friendly }} />
          <span className="text-xs text-slate-600">Friendly</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={info => navigate(`/games/${info.event.id}`)}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>

      {/* Upcoming list */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">All Fixtures</h2>
        {games
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(game => {
            const date = new Date(game.date)
            return (
              <div
                key={game.id}
                onClick={() => navigate(`/games/${game.id}`)}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className="w-1 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: GAME_TYPE_COLORS[game.type] }}
                />
                <div className="w-16 text-center flex-shrink-0">
                  <p className="text-xs text-slate-400 uppercase">{date.toLocaleDateString('en', { month: 'short' })}</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none">{date.getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {game.home_away === 'home' ? 'vs' : '@'} {game.opponent?.name ?? 'TBC'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {game.competition_name ?? game.type} · {game.venue}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {game.status === 'completed' ? (
                    <span className="text-sm font-bold text-slate-700">
                      {game.score_us} – {game.score_them}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 capitalize">{game.status}</span>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
