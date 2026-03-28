import { motion } from 'framer-motion'
import type { Leader } from '../types'

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

interface Props {
  leader: Leader
  selected?: boolean
  onClick?: () => void
}

export function LeaderCard({ leader, selected, onClick }: Props) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
      style={{
        background: selected ? 'var(--color-card-hover)' : 'var(--color-card)',
        border: selected ? '1px solid var(--color-bmw-blue)' : '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 16,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--color-bmw-blue)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: 16,
        flexShrink: 0,
      }}>
        {getInitials(leader.name)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--color-text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {leader.name}
        </div>
        <div style={{
          fontSize: 14,
          color: 'var(--color-text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {leader.role}
        </div>
      </div>
    </motion.div>
  )
}
