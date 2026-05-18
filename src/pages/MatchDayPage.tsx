import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { useAppStore } from '../stores/useAppStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { PitchFormation } from '../components/matchday/PitchFormation'
import { FORMATIONS, POSITION_LABELS } from '../lib/constants'
import type { MatchDayRecord, SquadSlot, MatchEvent, MatchEventType, Position } from '../types'

const TABS = ['Selection', 'Events', 'Report'] as const
type Tab = typeof TABS[number]

const EVENT_TYPES: { value: MatchEventType; label: string; emoji: string }[] = [
  { value: 'goal', label: 'Goal', emoji: '⚽' },
  { value: 'own_goal', label: 'Own Goal', emoji: '⚽ OG' },
  { value: 'yellow_card', label: 'Yellow Card', emoji: '🟨' },
  { value: 'red_card', label: 'Red Card', emoji: '🟥' },
  { value: 'substitution', label: 'Substitution', emoji: '↔' },
  { value: 'penalty_scored', label: 'Penalty Scored', emoji: '⚽ PEN' },
  { value: 'penalty_missed', label: 'Penalty Missed', emoji: '✗ PEN' },
  { value: 'injury', label: 'Injury', emoji: '🏥' },
]

export function MatchDayPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, players, matchDayRecords, upsertMatchDayRecord, updateGame } = useAppStore()

  const game = games.find(g => g.id === id)
  const existingRecord = matchDayRecords.find(r => r.game_id === id)

  const [tab, setTab] = useState<Tab>('Selection')
  const [formation, setFormation] = useState(existingRecord?.formation ?? '4-3-3')
  const [startingXI, setStartingXI] = useState<SquadSlot[]>(existingRecord?.starting_xi ?? [])
  const [substitutes, setSubstitutes] = useState<SquadSlot[]>(existingRecord?.substitutes ?? [])
  const [events, setEvents] = useState<MatchEvent[]>(existingRecord?.events ?? [])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [isSubs, setIsSubs] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [coachNotes, setCoachNotes] = useState(existingRecord?.tactics_notes ?? '')
  const [opponentNotes, setOpponentNotes] = useState(existingRecord?.opponent_notes ?? '')
  const [finalScoreUs, setFinalScoreUs] = useState<string>(
    game?.score_us !== undefined ? String(game.score_us) : ''
  )
  const [finalScoreThem, setFinalScoreThem] = useState<string>(
    game?.score_them !== undefined ? String(game.score_them) : ''
  )

  // Event form state
  const [eventType, setEventType] = useState<MatchEventType>('goal')
  const [eventMinute, setEventMinute] = useState('')
  const [eventPlayer, setEventPlayer] = useState('')
  const [eventPlayerOff, setEventPlayerOff] = useState('')
  const [eventAssist, setEventAssist] = useState('')

  if (!game) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Game not found</p>
        <button onClick={() => navigate('/calendar')} className="mt-3 text-green-600 hover:underline text-sm">
          Back to Calendar
        </button>
      </div>
    )
  }

  const recordId = existingRecord?.id ?? `mdr-${id}`

  const allPlayers = players.filter(p => p.squad_status !== 'inactive')
  const availablePlayers = allPlayers.filter(p => p.squad_status === 'active')
  const unavailablePlayers = allPlayers.filter(p => p.squad_status !== 'active')

  const assignedPlayerIds = new Set([
    ...startingXI.map(s => s.player_id),
    ...substitutes.map(s => s.player_id),
  ])

  const unassignedAvailable = availablePlayers.filter(p => !assignedPlayerIds.has(p.id))
  const unassignedUnavailable = unavailablePlayers.filter(p => !assignedPlayerIds.has(p.id))

  // Get FORMATION position for a slot number
  const FORMATION_POSITIONS: Record<string, string[]> = {
    '4-4-2': ['GK','RB','CB','CB','LB','RM','CM','CM','LM','ST','ST'],
    '4-3-3': ['GK','RB','CB','CB','LB','CM','CM','CM','RW','LW','ST'],
    '4-2-3-1': ['GK','RB','CB','CB','LB','CDM','CDM','RM','CAM','LM','ST'],
    '3-5-2': ['GK','CB','CB','CB','RM','CM','CM','CM','LM','ST','ST'],
    '5-3-2': ['GK','RB','CB','CB','CB','LB','CM','CM','CM','ST','ST'],
    '4-1-4-1': ['GK','RB','CB','CB','LB','CDM','RM','CM','CM','LM','ST'],
    '4-5-1': ['GK','RB','CB','CB','LB','RM','CM','CM','CM','LM','ST'],
    '3-4-3': ['GK','CB','CB','CB','RM','CM','CM','LM','RW','ST','LW'],
  }

  function getPositionForSlot(slotNumber: number): Position {
    const positions = FORMATION_POSITIONS[formation] ?? FORMATION_POSITIONS['4-3-3']
    return (positions[slotNumber - 1] ?? 'CM') as Position
  }

  function handleSlotClick(slotNumber: number) {
    if (selectedSlot === slotNumber) {
      setSelectedSlot(null)
    } else {
      setSelectedSlot(slotNumber)
    }
  }

  function assignPlayerToSlot(playerId: string) {
    if (selectedSlot === null) return
    const player = players.find(p => p.id === playerId)
    if (!player) return

    if (isSubs) {
      setSubstitutes(prev => {
        const filtered = prev.filter(s => s.slot_number !== selectedSlot)
        return [...filtered, {
          player_id: playerId,
          position: getPositionForSlot(1),
          slot_number: selectedSlot,
          player,
        }]
      })
    } else {
      setStartingXI(prev => {
        const filtered = prev.filter(s => s.slot_number !== selectedSlot)
        return [...filtered, {
          player_id: playerId,
          position: getPositionForSlot(selectedSlot),
          slot_number: selectedSlot,
          player,
        }]
      })
    }
    setSelectedSlot(null)
  }

  function removeFromSlot(slotNumber: number, fromSubs: boolean) {
    if (fromSubs) {
      setSubstitutes(prev => prev.filter(s => s.slot_number !== slotNumber))
    } else {
      setStartingXI(prev => prev.filter(s => s.slot_number !== slotNumber))
    }
  }

  // Compute live score from events
  const goalsUs = events.filter(e => e.type === 'goal' || e.type === 'penalty_scored').length
  const ownGoalsThem = events.filter(e => e.type === 'own_goal').length
  const totalUs = goalsUs + ownGoalsThem

  function saveRecord() {
    const record: MatchDayRecord = {
      id: recordId,
      game_id: id!,
      formation,
      starting_xi: startingXI,
      substitutes,
      events,
      tactics_notes: coachNotes,
      opponent_notes: opponentNotes,
    }
    upsertMatchDayRecord(record)
    toast.success('Match Day record saved!')
  }

  function saveReport() {
    const scoreUs = finalScoreUs !== '' ? parseInt(finalScoreUs) : undefined
    const scoreThem = finalScoreThem !== '' ? parseInt(finalScoreThem) : undefined
    let result: 'win' | 'draw' | 'loss' | undefined
    if (scoreUs !== undefined && scoreThem !== undefined) {
      result = scoreUs > scoreThem ? 'win' : scoreUs < scoreThem ? 'loss' : 'draw'
    }
    updateGame(id!, {
      status: 'completed',
      score_us: scoreUs,
      score_them: scoreThem,
      result,
    })
    saveRecord()
    toast.success('Match report saved!')
    navigate(`/games/${id}`)
  }

  function addEvent() {
    const player = players.find(p => p.id === eventPlayer)
    const playerOff = players.find(p => p.id === eventPlayerOff)
    const assistPlayer = players.find(p => p.id === eventAssist)

    const newEvent: MatchEvent = {
      id: crypto.randomUUID(),
      match_day_record_id: recordId,
      type: eventType,
      minute: parseInt(eventMinute) || 0,
      player_id: eventPlayer,
      player,
      player_off_id: playerOff?.id,
      player_off: playerOff,
      assist_player_id: assistPlayer?.id,
      assist_player: assistPlayer,
    }
    setEvents(prev => [...prev, newEvent])
    setShowEventModal(false)
    setEventMinute('')
    setEventPlayer('')
    setEventPlayerOff('')
    setEventAssist('')
  }

  const squadForEvents = [
    ...startingXI.map(s => s.player).filter(Boolean),
    ...substitutes.map(s => s.player).filter(Boolean),
  ] as typeof players

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white'

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(`/games/${id}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to Game
      </button>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Match Day</h1>
          <p className="text-slate-500 text-sm">
            vs {game.opponent?.name} · {format(parseISO(game.date), 'd MMM yyyy')}
          </p>
        </div>
        <Button onClick={saveRecord}>
          <Save size={16} />
          Save
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB: Selection */}
      {tab === 'Selection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Pitch */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Formation:</label>
              <select
                value={formation}
                onChange={e => { setFormation(e.target.value); setStartingXI([]); setSubstitutes([]) }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {FORMATIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              {selectedSlot && (
                <span className="text-xs text-amber-600 font-medium">
                  Select a player for slot {selectedSlot}
                </span>
              )}
            </div>

            {/* Toggle starting XI vs subs */}
            <div className="flex gap-2">
              <button
                onClick={() => { setIsSubs(false); setSelectedSlot(null) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !isSubs ? 'bg-[#0d1529] text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                Starting XI
              </button>
              <button
                onClick={() => { setIsSubs(true); setSelectedSlot(null) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isSubs ? 'bg-[#0d1529] text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                Substitutes
              </button>
            </div>

            {!isSubs ? (
              <PitchFormation
                formation={formation}
                slots={startingXI}
                onSlotClick={handleSlotClick}
                selectedSlot={selectedSlot}
              />
            ) : (
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Substitutes Bench</h3>
                <div className="space-y-2">
                  {substitutes.map(slot => (
                    <div key={slot.slot_number} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-amber-600 font-bold">
                        #{slot.player?.jersey_number ?? '–'}
                      </span>
                      <span className="text-sm font-medium text-slate-800 flex-1">
                        {slot.player ? `${slot.player.first_name} ${slot.player.last_name}` : 'Empty'}
                      </span>
                      <span className="text-xs text-slate-400">{POSITION_LABELS[slot.position] ?? slot.position}</span>
                      <button
                        onClick={() => removeFromSlot(slot.slot_number, true)}
                        className="text-red-400 hover:text-red-600 text-xs ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {substitutes.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-4">No substitutes added yet</p>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right: Player list */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-600">
              {selectedSlot
                ? `Assign to Slot ${selectedSlot} (${isSubs ? 'Sub' : 'Starting XI'})`
                : 'Players'
              }
            </h3>
            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {unassignedAvailable.map(player => (
                <div
                  key={player.id}
                  onClick={() => selectedSlot !== null ? assignPlayerToSlot(player.id) : undefined}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                    selectedSlot !== null
                      ? 'cursor-pointer hover:border-green-400 hover:bg-green-50 border-slate-200'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-amber-500 w-5">
                    {player.jersey_number ? `#${player.jersey_number}` : '–'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-xs text-slate-400">{player.primary_position}</p>
                  </div>
                  {selectedSlot !== null && (
                    <span className="text-green-500 text-xs">+</span>
                  )}
                </div>
              ))}
              {unassignedUnavailable.length > 0 && (
                <>
                  <p className="text-xs text-slate-400 pt-2 pb-1 font-medium">Unavailable</p>
                  {unassignedUnavailable.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50 opacity-50"
                    >
                      <span className="text-xs font-bold text-slate-400 w-5">
                        {player.jersey_number ? `#${player.jersey_number}` : '–'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-500 truncate">
                          {player.first_name} {player.last_name}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">{player.squad_status}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {assignedPlayerIds.size > 0 && (
                <>
                  <p className="text-xs text-slate-400 pt-2 pb-1 font-medium">Already assigned</p>
                  {[...startingXI, ...substitutes].map(slot => slot.player).filter(Boolean).map(player => (
                    <div
                      key={player!.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-green-100 bg-green-50"
                    >
                      <span className="text-xs font-bold text-amber-500 w-5">
                        {player!.jersey_number ? `#${player!.jersey_number}` : '–'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {player!.first_name} {player!.last_name}
                        </p>
                        <p className="text-xs text-slate-400">{player!.primary_position}</p>
                      </div>
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Starting XI summary */}
            <div className="text-xs text-slate-500 text-center">
              {startingXI.length}/11 starting · {substitutes.length} subs
            </div>
          </div>
        </div>
      )}

      {/* TAB: Events */}
      {tab === 'Events' && (
        <div className="space-y-4">
          {/* Live score */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-500 mb-2">Live Score (from events)</h3>
            <div className="flex items-center gap-4">
              <div className="text-center flex-1">
                <p className="text-xs text-slate-500">Us</p>
                <p className="text-4xl font-black text-slate-900">{totalUs}</p>
              </div>
              <div className="text-slate-300 text-2xl">–</div>
              <div className="text-center flex-1">
                <p className="text-xs text-slate-500">Them</p>
                <p className="text-4xl font-black text-slate-400">?</p>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Match Events ({events.length})</h3>
            <Button size="sm" onClick={() => setShowEventModal(true)}>
              <Plus size={14} />
              Add Event
            </Button>
          </div>

          <div className="space-y-2">
            {events
              .sort((a, b) => a.minute - b.minute)
              .map(event => {
                const typeInfo = EVENT_TYPES.find(et => et.value === event.type)
                return (
                  <Card key={event.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-sm w-8">{event.minute}'</span>
                      <span className="text-base">{typeInfo?.emoji}</span>
                      <div className="flex-1">
                        <span className="font-medium text-slate-800 text-sm">
                          {event.player?.first_name} {event.player?.last_name}
                        </span>
                        {event.assist_player && (
                          <span className="text-slate-400 text-xs ml-2">
                            (assist: {event.assist_player.first_name} {event.assist_player.last_name})
                          </span>
                        )}
                        {event.player_off && (
                          <span className="text-slate-400 text-xs ml-2">
                            ↔ {event.player_off.first_name} {event.player_off.last_name}
                          </span>
                        )}
                      </div>
                      <Badge variant="neutral" className="text-xs">{typeInfo?.label}</Badge>
                    </div>
                  </Card>
                )
              })}
            {events.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p>No events recorded yet.</p>
                <p className="text-sm mt-1">Click "Add Event" to record goals, cards, etc.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Report */}
      {tab === 'Report' && (
        <div className="space-y-4 max-w-2xl">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Final Score</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Our Goals</label>
                <input
                  type="number"
                  min={0}
                  value={finalScoreUs}
                  onChange={e => setFinalScoreUs(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div className="text-slate-400 font-bold text-2xl mt-5">–</div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Their Goals</label>
                <input
                  type="number"
                  min={0}
                  value={finalScoreThem}
                  onChange={e => setFinalScoreThem(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            </div>
            {finalScoreUs !== '' && finalScoreThem !== '' && (
              <div className="mt-3 text-center">
                <Badge
                  variant={
                    parseInt(finalScoreUs) > parseInt(finalScoreThem) ? 'success' :
                    parseInt(finalScoreUs) < parseInt(finalScoreThem) ? 'danger' : 'neutral'
                  }
                  className="text-sm px-4 py-1"
                >
                  {parseInt(finalScoreUs) > parseInt(finalScoreThem) ? 'WIN' :
                   parseInt(finalScoreUs) < parseInt(finalScoreThem) ? 'LOSS' : 'DRAW'}
                </Badge>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Events Summary</h3>
            <p className="text-sm text-slate-600">{events.length} events recorded</p>
            <div className="mt-2 space-y-1">
              {['goal','yellow_card','red_card','substitution'].map(type => {
                const count = events.filter(e => e.type === type).length
                const info = EVENT_TYPES.find(et => et.value === type)
                if (count === 0) return null
                return (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    <span>{info?.emoji}</span>
                    <span className="text-slate-700">{count}x {info?.label}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Tactics Notes</h3>
            <textarea
              value={coachNotes}
              onChange={e => setCoachNotes(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="Notes on our tactics, what worked, what to improve..."
            />
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Opponent Notes</h3>
            <textarea
              value={opponentNotes}
              onChange={e => setOpponentNotes(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Notes on the opponent's tactics..."
            />
          </Card>

          <Button onClick={saveReport} size="lg">
            <CheckCircle size={18} />
            Save Match Report
          </Button>
        </div>
      )}

      {/* Add Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="Add Match Event"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value as MatchEventType)}
              className={inputClass}
            >
              {EVENT_TYPES.map(et => (
                <option key={et.value} value={et.value}>{et.emoji} {et.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minute</label>
            <input
              type="number"
              min={1}
              max={120}
              value={eventMinute}
              onChange={e => setEventMinute(e.target.value)}
              className={inputClass}
              placeholder="e.g. 45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Player</label>
            <select value={eventPlayer} onChange={e => setEventPlayer(e.target.value)} className={inputClass}>
              <option value="">Select player</option>
              {(squadForEvents.length > 0 ? squadForEvents : players).map(p => (
                <option key={p.id} value={p.id}>
                  {p.jersey_number ? `#${p.jersey_number} ` : ''}{p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          {eventType === 'goal' || eventType === 'penalty_scored' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assist (optional)</label>
              <select value={eventAssist} onChange={e => setEventAssist(e.target.value)} className={inputClass}>
                <option value="">No assist</option>
                {(squadForEvents.length > 0 ? squadForEvents : players).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {eventType === 'substitution' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Player Off</label>
              <select value={eventPlayerOff} onChange={e => setEventPlayerOff(e.target.value)} className={inputClass}>
                <option value="">Select player off</option>
                {(squadForEvents.length > 0 ? squadForEvents : players).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex gap-3 pt-2">
            <Button onClick={addEvent} disabled={!eventPlayer || !eventMinute}>
              Add Event
            </Button>
            <Button variant="ghost" onClick={() => setShowEventModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
