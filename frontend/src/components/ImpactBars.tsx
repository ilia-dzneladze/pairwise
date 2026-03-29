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

        <span className={`badge badge--${data.confidence}`} style={{ flexShrink: 0, minWidth: 70, justifyContent: 'center' }}>
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
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid var(--color-border)',
              fontSize: 15,
              color: 'var(--color-text)',
              lineHeight: 1.6,
            }}>
              {data.reasoning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Legend() {
  return (
    <div
      className="card"
      style={{
        padding: '20px 24px',
        borderLeft: '4px solid var(--color-bmw-blue)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>
        How to Read This
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Score scale */}
        <div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 500, marginBottom: 8 }}>
            Score (0-100)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { range: '81-100', label: 'Excellent', color: 'var(--color-bmw-blue)', desc: 'This pairing will likely excel here' },
              { range: '61-80', label: 'Strong', color: 'var(--color-bmw-blue)', desc: 'Positive projected outcome' },
              { range: '41-60', label: 'Moderate', color: 'var(--color-amber)', desc: 'Mixed signals, may need attention' },
              { range: '0-40', label: 'At Risk', color: 'var(--color-alert-red)', desc: 'Likely friction area, mitigations recommended' },
            ].map(row => (
              <div key={row.range} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <div style={{ width: 24, height: 8, borderRadius: 4, background: row.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 500, width: 48, flexShrink: 0 }}>{row.range}</span>
                <span style={{ color: 'var(--color-text)' }}>{row.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence explanation */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 500, marginBottom: 8 }}>
            Confidence Badge
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>
            Indicates how much data the AI had to support this prediction.
            <span style={{ fontWeight: 500, color: 'var(--color-success)' }}> High</span> means the leaders' profiles gave clear signals.
            <span style={{ fontWeight: 500, color: 'var(--color-amber)' }}> Medium</span> means some inference was needed.
            <span style={{ fontWeight: 500, color: 'var(--color-alert-red)' }}> Low</span> means limited evidence — treat as directional, not definitive.
          </div>
        </div>

        {/* Click hint */}
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Click any bar to expand the AI's reasoning.
        </div>
      </div>
    </div>
  )
}

export function ImpactBars({ impact }: Props) {
  const entries = Object.entries(impact) as [string, ImpactScore][]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Legend />
      {entries.map(([key, data], i) => (
        <ImpactBar key={key} metricKey={key} data={data} delay={i * 0.08} />
      ))}
    </div>
  )
}
