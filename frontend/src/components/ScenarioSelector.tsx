import { motion } from 'framer-motion'
import type { Scenario } from '../types'

interface Props {
  scenarios: Scenario[]
  selected: string | null
  onSelect: (id: string) => void
}

export function ScenarioSelector({ scenarios, selected, onSelect }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${scenarios.length}, 1fr)`, gap: 16 }}>
      {scenarios.map(s => {
        const isActive = selected === s.id
        return (
          <motion.div
            key={s.id}
            onClick={() => onSelect(s.id)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
            style={{
              background: isActive ? 'var(--color-card-hover)' : 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderLeft: isActive ? '4px solid var(--color-bmw-blue)' : '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '20px 20px 20px 20px',
              cursor: 'pointer',
              transition: 'background 150ms ease, border-color 150ms ease',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 500,
              fontSize: 16,
              color: 'var(--color-text)',
              marginBottom: 4,
            }}>
              {s.name}
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--color-text-muted)',
              lineHeight: 1.4,
            }}>
              {s.description}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
