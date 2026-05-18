import { create } from 'zustand'
import type { Player, Game, Opponent, MatchDayRecord, Season, TrainingSession, MatchEvent } from '../types'

const MOCK_SEASON: Season = {
  id: 's1', name: '2025/26', start_date: '2025-08-01', end_date: '2026-05-31',
  competitions: ['Liga Distrital', 'Taça AF Lisboa'], is_current: true,
}

const MOCK_PLAYERS: Player[] = [
  { id:'p1', first_name:'João', last_name:'Silva', date_of_birth:'1995-03-15', primary_position:'GK', secondary_positions:[], preferred_foot:'right', jersey_number:1, squad_status:'active', join_date:'2022-07-01', created_at:'2022-07-01T00:00:00Z' },
  { id:'p2', first_name:'Carlos', last_name:'Mendes', date_of_birth:'1998-07-22', primary_position:'RB', secondary_positions:['CB'], preferred_foot:'right', jersey_number:2, squad_status:'active', join_date:'2023-01-15', created_at:'2023-01-15T00:00:00Z' },
  { id:'p3', first_name:'André', last_name:'Costa', date_of_birth:'1997-11-08', primary_position:'CB', secondary_positions:[], preferred_foot:'right', jersey_number:4, squad_status:'active', join_date:'2022-07-01', created_at:'2022-07-01T00:00:00Z' },
  { id:'p4', first_name:'Miguel', last_name:'Ferreira', date_of_birth:'1996-04-30', primary_position:'CB', secondary_positions:['LB'], preferred_foot:'left', jersey_number:5, squad_status:'active', join_date:'2022-07-01', created_at:'2022-07-01T00:00:00Z' },
  { id:'p5', first_name:'Rui', last_name:'Santos', date_of_birth:'1999-09-12', primary_position:'LB', secondary_positions:[], preferred_foot:'left', jersey_number:3, squad_status:'active', join_date:'2023-07-01', created_at:'2023-07-01T00:00:00Z' },
  { id:'p6', first_name:'Tiago', last_name:'Oliveira', date_of_birth:'1997-02-18', primary_position:'CDM', secondary_positions:['CM'], preferred_foot:'right', jersey_number:6, squad_status:'active', join_date:'2022-07-01', created_at:'2022-07-01T00:00:00Z' },
  { id:'p7', first_name:'Pedro', last_name:'Rodrigues', date_of_birth:'1998-06-25', primary_position:'CM', secondary_positions:['CAM'], preferred_foot:'right', jersey_number:8, squad_status:'active', join_date:'2022-07-01', created_at:'2022-07-01T00:00:00Z' },
  { id:'p8', first_name:'Nuno', last_name:'Alves', date_of_birth:'2000-01-10', primary_position:'CM', secondary_positions:[], preferred_foot:'right', jersey_number:10, squad_status:'active', join_date:'2024-01-01', created_at:'2024-01-01T00:00:00Z' },
  { id:'p9', first_name:'Diogo', last_name:'Lopes', date_of_birth:'1996-08-03', primary_position:'RW', secondary_positions:['RM'], preferred_foot:'right', jersey_number:7, squad_status:'active', join_date:'2022-07-01', created_at:'2022-07-01T00:00:00Z' },
  { id:'p10', first_name:'Filipe', last_name:'Gomes', date_of_birth:'1997-12-20', primary_position:'LW', secondary_positions:['LM'], preferred_foot:'left', jersey_number:11, squad_status:'injured', join_date:'2022-07-01', created_at:'2022-07-01T00:00:00Z' },
  { id:'p11', first_name:'Rafael', last_name:'Martins', date_of_birth:'1995-05-14', primary_position:'ST', secondary_positions:['CF'], preferred_foot:'right', jersey_number:9, squad_status:'active', join_date:'2022-07-01', created_at:'2022-07-01T00:00:00Z' },
  { id:'p12', first_name:'Gustavo', last_name:'Pereira', date_of_birth:'2001-03-28', primary_position:'ST', secondary_positions:[], preferred_foot:'right', jersey_number:18, squad_status:'active', join_date:'2024-07-01', created_at:'2024-07-01T00:00:00Z' },
  { id:'p13', first_name:'Bernardo', last_name:'Cardoso', date_of_birth:'1999-10-05', primary_position:'CAM', secondary_positions:['CM'], preferred_foot:'right', jersey_number:14, squad_status:'active', join_date:'2023-07-01', created_at:'2023-07-01T00:00:00Z' },
  { id:'p14', first_name:'Sandro', last_name:'Vieira', date_of_birth:'1998-07-17', primary_position:'CDM', secondary_positions:['CB'], preferred_foot:'right', jersey_number:16, squad_status:'suspended', join_date:'2023-01-01', created_at:'2023-01-01T00:00:00Z' },
]

const MOCK_OPPONENTS: Opponent[] = [
  { id:'o1', name:'Sporting CP B', short_name:'Sporting B', home_ground:'Academia Sporting', usual_formation:'4-3-3' },
  { id:'o2', name:'Benfica B', short_name:'Benfica B', home_ground:'Caixa Futebol Campus', usual_formation:'4-2-3-1' },
  { id:'o3', name:'CF Estrela', short_name:'Estrela', home_ground:'Estádio José Gomes' },
  { id:'o4', name:'Atlético CP', short_name:'Atlético', home_ground:'Estádio Municipal' },
]

const today = new Date()
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate()+n); return r.toISOString() }

const MOCK_GAMES: Game[] = [
  { id:'g1', season_id:'s1', type:'championship', competition_name:'Liga Distrital', round:'Jornada 8', home_away:'home', opponent_id:'o1', opponent:MOCK_OPPONENTS[0], date:addDays(today,-14), venue:'Campo Municipal', status:'completed', score_us:2, score_them:1, result:'win' },
  { id:'g2', season_id:'s1', type:'championship', competition_name:'Liga Distrital', round:'Jornada 9', home_away:'away', opponent_id:'o2', opponent:MOCK_OPPONENTS[1], date:addDays(today,-7), venue:'Caixa Futebol Campus', status:'completed', score_us:0, score_them:0, result:'draw' },
  { id:'g3', season_id:'s1', type:'championship', competition_name:'Liga Distrital', round:'Jornada 10', home_away:'home', opponent_id:'o3', opponent:MOCK_OPPONENTS[2], date:addDays(today,5), venue:'Campo Municipal', status:'scheduled' },
  { id:'g4', season_id:'s1', type:'cup', competition_name:'Taça AF Lisboa', round:'Quarter-Final', home_away:'away', opponent_id:'o4', opponent:MOCK_OPPONENTS[3], date:addDays(today,12), venue:'Estádio Municipal', status:'scheduled' },
  { id:'g5', season_id:'s1', type:'friendly', home_away:'home', opponent_id:'o1', opponent:MOCK_OPPONENTS[0], date:addDays(today,19), venue:'Campo Municipal', status:'scheduled' },
]

const MOCK_MATCH_EVENTS: MatchEvent[] = [
  { id:'e1', match_day_record_id:'m1', type:'goal', minute:23, player_id:'p11', assist_player_id:'p7', player:MOCK_PLAYERS[10], assist_player:MOCK_PLAYERS[6] },
  { id:'e2', match_day_record_id:'m1', type:'yellow_card', minute:34, player_id:'p6', player:MOCK_PLAYERS[5] },
  { id:'e3', match_day_record_id:'m1', type:'goal', minute:67, player_id:'p13', player:MOCK_PLAYERS[12] },
  { id:'e4', match_day_record_id:'m1', type:'substitution', minute:75, player_id:'p12', player_off_id:'p9', player:MOCK_PLAYERS[11], player_off:MOCK_PLAYERS[8] },
]

const MOCK_MATCH_RECORDS: MatchDayRecord[] = [
  {
    id:'m1', game_id:'g1', formation:'4-3-3',
    starting_xi:[
      {player_id:'p1',position:'GK',slot_number:1,player:MOCK_PLAYERS[0]},
      {player_id:'p2',position:'RB',slot_number:2,player:MOCK_PLAYERS[1]},
      {player_id:'p3',position:'CB',slot_number:3,player:MOCK_PLAYERS[2]},
      {player_id:'p4',position:'CB',slot_number:4,player:MOCK_PLAYERS[3]},
      {player_id:'p5',position:'LB',slot_number:5,player:MOCK_PLAYERS[4]},
      {player_id:'p6',position:'CDM',slot_number:6,player:MOCK_PLAYERS[5]},
      {player_id:'p7',position:'CM',slot_number:7,player:MOCK_PLAYERS[6]},
      {player_id:'p8',position:'CM',slot_number:8,player:MOCK_PLAYERS[7]},
      {player_id:'p9',position:'RW',slot_number:9,player:MOCK_PLAYERS[8]},
      {player_id:'p10',position:'LW',slot_number:10,player:MOCK_PLAYERS[9]},
      {player_id:'p11',position:'ST',slot_number:11,player:MOCK_PLAYERS[10]},
    ],
    substitutes:[
      {player_id:'p12',position:'ST',slot_number:12,player:MOCK_PLAYERS[11]},
      {player_id:'p13',position:'CAM',slot_number:13,player:MOCK_PLAYERS[12]},
    ],
    events: MOCK_MATCH_EVENTS,
  }
]

interface AppState {
  players: Player[]
  games: Game[]
  opponents: Opponent[]
  matchDayRecords: MatchDayRecord[]
  seasons: Season[]
  currentSeason: Season
  trainingSessions: TrainingSession[]
  addPlayer: (p: Omit<Player,'id'|'created_at'>) => void
  updatePlayer: (id: string, p: Partial<Player>) => void
  deletePlayer: (id: string) => void
  addGame: (g: Omit<Game,'id'>) => void
  updateGame: (id: string, g: Partial<Game>) => void
  deleteGame: (id: string) => void
  addOpponent: (o: Omit<Opponent,'id'>) => void
  upsertMatchDayRecord: (r: MatchDayRecord) => void
  addMatchEvent: (event: Omit<MatchEvent,'id'>) => void
  addTrainingSession: (s: Omit<TrainingSession,'id'>) => void
}

export const useAppStore = create<AppState>((set) => ({
  players: MOCK_PLAYERS,
  games: MOCK_GAMES,
  opponents: MOCK_OPPONENTS,
  matchDayRecords: MOCK_MATCH_RECORDS,
  seasons: [MOCK_SEASON],
  currentSeason: MOCK_SEASON,
  trainingSessions: [],
  addPlayer: (p) => set((s) => ({ players: [...s.players, { ...p, id: crypto.randomUUID(), created_at: new Date().toISOString() }] })),
  updatePlayer: (id, p) => set((s) => ({ players: s.players.map(pl => pl.id===id ? {...pl,...p} : pl) })),
  deletePlayer: (id) => set((s) => ({ players: s.players.filter(pl => pl.id!==id) })),
  addGame: (g) => set((s) => {
    const opponent = s.opponents.find(o => o.id === g.opponent_id)
    return { games: [...s.games, { ...g, id: crypto.randomUUID(), opponent }] }
  }),
  updateGame: (id, g) => set((s) => ({ games: s.games.map(gm => gm.id===id ? {...gm,...g} : gm) })),
  deleteGame: (id) => set((s) => ({ games: s.games.filter(gm => gm.id!==id) })),
  addOpponent: (o) => set((s) => ({ opponents: [...s.opponents, { ...o, id: crypto.randomUUID() }] })),
  upsertMatchDayRecord: (r) => set((s) => {
    const exists = s.matchDayRecords.find(m => m.id===r.id)
    if (exists) return { matchDayRecords: s.matchDayRecords.map(m => m.id===r.id ? r : m) }
    return { matchDayRecords: [...s.matchDayRecords, r] }
  }),
  addMatchEvent: (event) => set((s) => {
    const newEvent: MatchEvent = { ...event, id: crypto.randomUUID() }
    return {
      matchDayRecords: s.matchDayRecords.map(r =>
        r.id === event.match_day_record_id ? { ...r, events: [...r.events, newEvent] } : r
      )
    }
  }),
  addTrainingSession: (s) => set((st) => ({
    trainingSessions: [...st.trainingSessions, { ...s, id: crypto.randomUUID() }]
  })),
}))
