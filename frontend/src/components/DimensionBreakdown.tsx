import { motion } from 'framer-motion'
import type { DimensionResult } from '../types'
import { DIMENSION_META } from '../types'

interface Props {
  dimensions: DimensionResult[]
  leaderAName: string
  leaderBName: string
}

const INTERACTION_COLORS = {
  synergy: 'var(--color-success)',
  neutral: 'var(--color-text-muted)',
  friction: 'var(--color-alert-red)',
}

function DimensionRow({ d, leaderAName, leaderBName }: { d: DimensionResult; leaderAName: string; leaderBName: string }) {
  const meta = DIMENSION_META[d.dimension]
  const label = meta?.label || d.dimension
  const lowLabel = meta?.low || '1'
  const highLabel = meta?.high || '10'
  const color = INTERACTION_COLORS[d.interaction]

  // Position on 1-10 scale, mapped to 0-100%
  const posA = ((d.score_a - 1) / 9) * 100
  const posB = ((d.score_b - 1) / 9) * 100
  const minPos = Math.min(posA, posB)
  const maxPos = Math.max(posA, posB)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="card"
      style={{ padding: 20 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 16 }}>
          {label}
        </span>
        <span className={`badge badge--${d.interaction}`}>
          {d.interaction.toUpperCase()}
        </span>
      </div>

      {/* Visual bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
        <div style={{ position: 'relative', height: 20 }}>
          {/* Track */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 2,
            background: 'var(--color-border)',
            transform: 'translateY(-50%)',
          }} />

          {/* Highlighted range */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${minPos}%`,
            width: `${maxPos - minPos}%`,
            height: 6,
            background: color,
            opacity: 0.2,
            transform: 'translateY(-50%)',
            borderRadius: 3,
          }} />

          {/* Leader A marker */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${posA}%`,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--color-bmw-blue)',
            border: '2px solid var(--color-card)',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
          }}
            title={`${leaderAName}: ${d.score_a}`}
          />

          {/* Leader B marker */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${posB}%`,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--color-ice-blue)',
            border: '2px solid var(--color-card)',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
          }}
            title={`${leaderBName}: ${d.score_b}`}
          />
        </div>
      </div>

      {/* Scores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>
            <span style={{ color: 'var(--color-bmw-blue)', fontWeight: 500 }}>{leaderAName.split(' ').pop()}</span>
            : {d.score_a}
          </span>
          <span>
            <span style={{ color: 'var(--color-ice-blue)', fontWeight: 500 }}>{leaderBName.split(' ').pop()}</span>
            : {d.score_b}
          </span>
        </div>
        <span style={{ color: 'var(--color-text-muted)' }}>
          &Delta; {d.delta.toFixed(1)}
        </span>
      </div>

      {/* Reasoning */}
      <div style={{
        fontSize: 13,
        color: 'var(--color-text-muted)',
        fontStyle: 'italic',
        lineHeight: 1.5,
      }}>
        {d.reasoning}
      </div>
    </motion.div>
  )
}

export function DimensionBreakdown({ dimensions, leaderAName, leaderBName }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {dimensions.map((d, i) => (
        <motion.div
          key={d.dimension}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
        >
          <DimensionRow d={d} leaderAName={leaderAName} leaderBName={leaderBName} />
        </motion.div>
      ))}
    </div>
  )
}
