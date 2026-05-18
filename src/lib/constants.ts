import type { Position } from '../types'

export const POSITIONS: Position[] = ['GK','RB','CB','LB','CDM','CM','CAM','RM','LM','RW','LW','ST','CF','SS']

export const FORMATIONS = ['4-4-2','4-3-3','4-2-3-1','3-5-2','5-3-2','4-1-4-1','4-5-1','3-4-3']

export const POSITION_LABELS: Record<string, string> = {
  GK:'Goalkeeper', RB:'Right Back', CB:'Centre Back', LB:'Left Back',
  CDM:'Defensive Mid', CM:'Centre Mid', CAM:'Attacking Mid',
  RM:'Right Mid', LM:'Left Mid', RW:'Right Wing', LW:'Left Wing',
  ST:'Striker', CF:'Centre Forward', SS:'Second Striker'
}

export const GAME_TYPE_COLORS: Record<string, string> = {
  friendly: '#64748b',
  championship: '#16a34a',
  cup: '#f59e0b',
}
