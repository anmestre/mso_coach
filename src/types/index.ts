export type Position = 'GK' | 'RB' | 'CB' | 'LB' | 'CDM' | 'CM' | 'CAM' | 'RM' | 'LM' | 'RW' | 'LW' | 'ST' | 'CF' | 'SS'

export type SquadStatus = 'active' | 'injured' | 'suspended' | 'inactive'
export type PreferredFoot = 'left' | 'right' | 'both'

export interface Player {
  id: string
  first_name: string
  last_name: string
  nickname?: string
  date_of_birth: string
  photo_url?: string
  phone?: string
  email?: string
  primary_position: Position
  secondary_positions: Position[]
  preferred_foot: PreferredFoot
  jersey_number?: number
  squad_status: SquadStatus
  join_date: string
  notes?: string
  created_at: string
}

export type GameType = 'friendly' | 'championship' | 'cup'
export type HomeAway = 'home' | 'away' | 'neutral'
export type GameStatus = 'scheduled' | 'completed' | 'cancelled' | 'postponed'

export interface Opponent {
  id: string
  name: string
  short_name?: string
  logo_url?: string
  home_ground?: string
  usual_formation?: string
  notes?: string
}

export interface Game {
  id: string
  season_id: string
  type: GameType
  competition_name?: string
  round?: string
  home_away: HomeAway
  opponent_id: string
  opponent?: Opponent
  date: string
  venue: string
  status: GameStatus
  score_us?: number
  score_them?: number
  result?: 'win' | 'draw' | 'loss'
  notes?: string
}

export type MatchEventType = 'goal' | 'own_goal' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'penalty_scored' | 'penalty_missed'

export interface SquadSlot {
  player_id: string
  position: Position
  slot_number: number
  player?: Player
}

export interface MatchEvent {
  id: string
  match_day_record_id: string
  type: MatchEventType
  minute: number
  player_id: string
  player_off_id?: string
  assist_player_id?: string
  notes?: string
  player?: Player
  player_off?: Player
  assist_player?: Player
}

export interface MatchDayRecord {
  id: string
  game_id: string
  formation: string
  starting_xi: SquadSlot[]
  substitutes: SquadSlot[]
  tactics_notes?: string
  opponent_notes?: string
  events: MatchEvent[]
}

export type SessionType = 'technical' | 'tactical' | 'physical' | 'recovery' | 'set_pieces' | 'scrimmage' | 'mixed'

export interface TrainingSession {
  id: string
  season_id: string
  date: string
  duration_minutes: number
  location: string
  type: SessionType
  title: string
  description?: string
  objectives: string[]
}

export interface Season {
  id: string
  name: string
  start_date: string
  end_date: string
  competitions: string[]
  is_current: boolean
}

export interface PlayerAvailability {
  id: string
  player_id: string
  from_date: string
  to_date: string
  reason: 'injury' | 'suspension' | 'personal' | 'holiday' | 'work'
  notes?: string
}
