import type { SquadSlot, Player } from '../../types'

interface SlotCoord {
  x: number
  y: number
  position: string
}

const FORMATION_COORDS: Record<string, SlotCoord[]> = {
  '4-4-2': [
    { x: 50, y: 88, position: 'GK' },
    { x: 82, y: 70, position: 'RB' },
    { x: 62, y: 70, position: 'CB' },
    { x: 38, y: 70, position: 'CB' },
    { x: 18, y: 70, position: 'LB' },
    { x: 82, y: 48, position: 'RM' },
    { x: 62, y: 48, position: 'CM' },
    { x: 38, y: 48, position: 'CM' },
    { x: 18, y: 48, position: 'LM' },
    { x: 38, y: 22, position: 'ST' },
    { x: 62, y: 22, position: 'ST' },
  ],
  '4-3-3': [
    { x: 50, y: 88, position: 'GK' },
    { x: 82, y: 70, position: 'RB' },
    { x: 62, y: 70, position: 'CB' },
    { x: 38, y: 70, position: 'CB' },
    { x: 18, y: 70, position: 'LB' },
    { x: 70, y: 50, position: 'CM' },
    { x: 50, y: 45, position: 'CM' },
    { x: 30, y: 50, position: 'CM' },
    { x: 80, y: 22, position: 'RW' },
    { x: 20, y: 22, position: 'LW' },
    { x: 50, y: 15, position: 'ST' },
  ],
  '4-2-3-1': [
    { x: 50, y: 88, position: 'GK' },
    { x: 82, y: 72, position: 'RB' },
    { x: 62, y: 72, position: 'CB' },
    { x: 38, y: 72, position: 'CB' },
    { x: 18, y: 72, position: 'LB' },
    { x: 60, y: 56, position: 'CDM' },
    { x: 40, y: 56, position: 'CDM' },
    { x: 80, y: 38, position: 'RM' },
    { x: 50, y: 36, position: 'CAM' },
    { x: 20, y: 38, position: 'LM' },
    { x: 50, y: 18, position: 'ST' },
  ],
  '3-5-2': [
    { x: 50, y: 88, position: 'GK' },
    { x: 70, y: 72, position: 'CB' },
    { x: 50, y: 72, position: 'CB' },
    { x: 30, y: 72, position: 'CB' },
    { x: 85, y: 52, position: 'RM' },
    { x: 65, y: 52, position: 'CM' },
    { x: 50, y: 48, position: 'CM' },
    { x: 35, y: 52, position: 'CM' },
    { x: 15, y: 52, position: 'LM' },
    { x: 35, y: 22, position: 'ST' },
    { x: 65, y: 22, position: 'ST' },
  ],
  '4-1-4-1': [
    { x: 50, y: 88, position: 'GK' },
    { x: 82, y: 72, position: 'RB' },
    { x: 62, y: 72, position: 'CB' },
    { x: 38, y: 72, position: 'CB' },
    { x: 18, y: 72, position: 'LB' },
    { x: 50, y: 58, position: 'CDM' },
    { x: 82, y: 44, position: 'RM' },
    { x: 62, y: 44, position: 'CM' },
    { x: 38, y: 44, position: 'CM' },
    { x: 18, y: 44, position: 'LM' },
    { x: 50, y: 18, position: 'ST' },
  ],
  '4-5-1': [
    { x: 50, y: 88, position: 'GK' },
    { x: 82, y: 72, position: 'RB' },
    { x: 62, y: 72, position: 'CB' },
    { x: 38, y: 72, position: 'CB' },
    { x: 18, y: 72, position: 'LB' },
    { x: 85, y: 48, position: 'RM' },
    { x: 68, y: 48, position: 'CM' },
    { x: 50, y: 48, position: 'CM' },
    { x: 32, y: 48, position: 'CM' },
    { x: 15, y: 48, position: 'LM' },
    { x: 50, y: 18, position: 'ST' },
  ],
  '3-4-3': [
    { x: 50, y: 88, position: 'GK' },
    { x: 70, y: 72, position: 'CB' },
    { x: 50, y: 72, position: 'CB' },
    { x: 30, y: 72, position: 'CB' },
    { x: 80, y: 52, position: 'RM' },
    { x: 57, y: 52, position: 'CM' },
    { x: 43, y: 52, position: 'CM' },
    { x: 20, y: 52, position: 'LM' },
    { x: 78, y: 22, position: 'RW' },
    { x: 50, y: 18, position: 'ST' },
    { x: 22, y: 22, position: 'LW' },
  ],
  '5-3-2': [
    { x: 50, y: 88, position: 'GK' },
    { x: 88, y: 68, position: 'RB' },
    { x: 70, y: 72, position: 'CB' },
    { x: 50, y: 72, position: 'CB' },
    { x: 30, y: 72, position: 'CB' },
    { x: 12, y: 68, position: 'LB' },
    { x: 68, y: 48, position: 'CM' },
    { x: 50, y: 45, position: 'CM' },
    { x: 32, y: 48, position: 'CM' },
    { x: 35, y: 22, position: 'ST' },
    { x: 65, y: 22, position: 'ST' },
  ],
}

function getCoords(formation: string): SlotCoord[] {
  return FORMATION_COORDS[formation] ?? FORMATION_COORDS['4-3-3']
}

interface PitchFormationProps {
  formation: string
  slots: SquadSlot[]
  onSlotClick?: (slotNumber: number) => void
  selectedSlot?: number | null
  availablePlayers?: Player[]
}

export function PitchFormation({ formation, slots, onSlotClick, selectedSlot }: PitchFormationProps) {
  const coords = getCoords(formation)

  return (
    <div className="relative w-full" style={{ paddingBottom: '140%' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 140"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Pitch background */}
        <rect x="0" y="0" width="100" height="140" fill="#166534" rx="2" />

        {/* Grass stripes */}
        {[0,1,2,3,4,5,6].map(i => (
          <rect key={i} x="0" y={i * 20} width="100" height="10" fill="#15803d" opacity="0.5" />
        ))}

        {/* Pitch markings */}
        {/* Outer border */}
        <rect x="4" y="6" width="92" height="128" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />

        {/* Centre line */}
        <line x1="4" y1="70" x2="96" y2="70" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />

        {/* Centre circle */}
        <circle cx="50" cy="70" r="10" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        <circle cx="50" cy="70" r="0.8" fill="rgba(255,255,255,0.6)" />

        {/* Top penalty area */}
        <rect x="22" y="6" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        {/* Top goal area */}
        <rect x="34" y="6" width="32" height="10" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        {/* Top goal */}
        <rect x="39" y="4" width="22" height="4" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        {/* Top penalty spot */}
        <circle cx="50" cy="20" r="0.8" fill="rgba(255,255,255,0.6)" />
        {/* Top penalty arc */}
        <path d="M 38 28 A 12 12 0 0 1 62 28" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />

        {/* Bottom penalty area */}
        <rect x="22" y="112" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        {/* Bottom goal area */}
        <rect x="34" y="124" width="32" height="10" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        {/* Bottom goal */}
        <rect x="39" y="130" width="22" height="4" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        {/* Bottom penalty spot */}
        <circle cx="50" cy="120" r="0.8" fill="rgba(255,255,255,0.6)" />
        {/* Bottom penalty arc */}
        <path d="M 38 112 A 12 12 0 0 0 62 112" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />

        {/* Corner arcs */}
        <path d="M 4 9 A 3 3 0 0 1 7 6" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        <path d="M 93 6 A 3 3 0 0 1 96 9" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        <path d="M 4 131 A 3 3 0 0 0 7 134" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        <path d="M 93 134 A 3 3 0 0 0 96 131" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />

        {/* Player slots */}
        {coords.map((coord, index) => {
          const slotNumber = index + 1
          const slot = slots.find(s => s.slot_number === slotNumber)
          const player = slot?.player
          const isSelected = selectedSlot === slotNumber
          const hasPlayer = Boolean(player)

          const cx = coord.x
          const cy = coord.y

          return (
            <g
              key={slotNumber}
              onClick={() => onSlotClick?.(slotNumber)}
              style={{ cursor: onSlotClick ? 'pointer' : 'default' }}
            >
              {/* Circle */}
              <circle
                cx={cx}
                cy={cy}
                r="5.5"
                fill={hasPlayer ? (isSelected ? '#f59e0b' : '#0d1529') : (isSelected ? '#f59e0b' : 'rgba(255,255,255,0.15)')}
                stroke={isSelected ? '#f59e0b' : 'rgba(255,255,255,0.8)'}
                strokeWidth={isSelected ? "1" : "0.5"}
              />
              {/* Position label inside circle */}
              <text
                x={cx}
                y={cy + 0.8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="2.8"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {coord.position}
              </text>
              {/* Jersey number */}
              {player?.jersey_number && (
                <text
                  x={cx + 4.5}
                  y={cy - 4}
                  textAnchor="middle"
                  fill="#f59e0b"
                  fontSize="2.2"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {player.jersey_number}
                </text>
              )}
              {/* Player name below circle */}
              {player && (
                <text
                  x={cx}
                  y={cy + 7.5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="2.5"
                  fontWeight="600"
                  style={{ pointerEvents: 'none' }}
                >
                  {player.last_name.length > 8 ? player.last_name.substring(0, 8) + '.' : player.last_name}
                </text>
              )}
              {/* Empty slot label */}
              {!player && (
                <text
                  x={cx}
                  y={cy + 8}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="2.3"
                  style={{ pointerEvents: 'none' }}
                >
                  Empty
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
