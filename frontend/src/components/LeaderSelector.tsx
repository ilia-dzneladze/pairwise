import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Link as LinkIcon } from 'lucide-react'
import { LeaderCard } from './LeaderCard'
import type { Leader } from '../types'

interface SlotProps {
  label: string
  leader: Leader | null
  leaders: Leader[]
  onSelect: (leader: Leader) => void
}

function LeaderSlot({ label, leader, leaders, onSelect }: SlotProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      {leader ? (
        <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
          <LeaderCard leader={leader} selected />
        </div>
      ) : (
        <div
          onClick={() => setOpen(!open)}
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            minHeight: 80,
            transition: 'border-color 150ms ease',
          }}
        >
          <UserPlus size={20} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 15 }}>
            {label}
          </span>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 8,
              background: '#0A0A0A',
              border: '1px solid rgba(45, 64, 70, 0.5)',
              borderRadius: 12,
              padding: 8,
              zIndex: 50,
              maxHeight: 320,
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {leaders.map(l => (
              <LeaderCard
                key={l.id}
                leader={l}
                selected={leader?.id === l.id}
                onClick={() => { onSelect(l); setOpen(false) }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface Props {
  leaders: Leader[]
  leaderA: Leader | null
  leaderB: Leader | null
  onSelectA: (leader: Leader) => void
  onSelectB: (leader: Leader) => void
}

export function LeaderSelector({ leaders, leaderA, leaderB, onSelectA, onSelectB }: Props) {
  const sameLeader = leaderA && leaderB && leaderA.id === leaderB.id

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
        <LeaderSlot label="Select Leader A" leader={leaderA} leaders={leaders} onSelect={onSelectA} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: 'var(--color-bmw-blue)',
          flexShrink: 0,
        }}>
          <LinkIcon size={24} />
        </div>
        <LeaderSlot label="Select Leader B" leader={leaderB} leaders={leaders} onSelect={onSelectB} />
      </div>
      {sameLeader && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: 'var(--color-alert-red)',
            fontSize: 13,
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          Select two different leaders to compare.
        </motion.div>
      )}
    </div>
  )
}
