import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { ImpactScore } from '../types'

interface Props {
  impact: {
    execution_speed: ImpactScore
    team_morale: ImpactScore
    innovation_rate: ImpactScore
    quality_control: ImpactScore
  }
}

const LABELS: Record<string, string> = {
  execution_speed: 'Execution Speed',
  team_morale: 'Team Morale',
  innovation_rate: 'Innovation Rate',
  quality_control: 'Quality Control',
}

function getBarColor(score: number): string {
  if (score <= 40) return 'var(--color-alert-red)'
  if (score <= 60) return 'var(--color-amber)'
  return 'var(--color-bmw-blue)'
}

function useAnimatedValue(target: number, duration = 800): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

function ImpactBar({ metricKey, data, delay }: { metricKey: string; data: ImpactScore; delay: number }) {
  const [expanded, setExpanded] = useState(false)
  const animated = useAnimatedValue(data.score)
  const barColor = getBarColor(data.score)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card"
      style={{ padding: '16px 20px', cursor: 'pointer' }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 500,
          fontSize: 15,
          width: 140,
          flexShrink: 0,
        }}>
          {LABELS[metricKey]}
        </div>

        {/* Bar container */}
        <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.score}%` }}
            transition={{ duration: 0.8, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: '100%',
              background: barColor,
              borderRadius: 5,
            }}
          />
        </div>

        <div style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 18,
          width: 36,
          textAlign: 'right',
          flexShrink: 0,
        }}>
          {animated}
        </div>

        <span className={`badge badge--${data.confidence}`} style={{ flexShrink: 0 }}>
          {data.confidence}
        </span>

        <ChevronDown
          size={16}
          style={{
            color: 'var(--color-text-muted)',
            transition: 'transform 150ms ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--color-border)',
              fontSize: 13,
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}>
              {data.reasoning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ImpactBars({ impact }: Props) {
  const entries = Object.entries(impact) as [string, ImpactScore][]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {entries.map(([key, data], i) => (
        <ImpactBar key={key} metricKey={key} data={data} delay={i * 0.08} />
      ))}
    </div>
  )
}
