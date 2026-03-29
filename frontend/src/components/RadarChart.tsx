import { useEffect, useState } from 'react'
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { AnalysisResult } from '../types'
import { DIMENSION_META } from '../types'

interface Props {
  result: AnalysisResult
}

function useCountUp(target: number, duration = 800): number {
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

function CustomAxisTick({ x, y, payload, cx, cy }: any) {
  const dim = Object.entries(DIMENSION_META).find(([, v]) => v.label === payload.value)
  const meta = dim?.[1]

  // Push labels further from center
  const dx = x - cx
  const dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const push = 18
  const nx = x + (dx / dist) * push
  const ny = y + (dy / dist) * push

  return (
    <g transform={`translate(${nx},${ny})`}>
      <text
        textAnchor="middle"
        fill="var(--color-text)"
        fontSize={14}
        fontFamily="var(--font-heading)"
        fontWeight={600}
        dy={4}
      >
        {payload.value}
      </text>
      {meta && (
        <title>{`${meta.low} (1) ← → ${meta.high} (10)`}</title>
      )}
    </g>
  )
}

export function CompatibilityRadar({ result }: Props) {
  const [expanded, setExpanded] = useState(false)
  const score = useCountUp(result.compatibility.overall_score)
  const scoreColor = score >= 75 ? 'var(--color-success)' : score >= 50 ? 'var(--color-amber)' : 'var(--color-alert-red)'

  const data = result.compatibility.dimensions.map(d => ({
    dimension: DIMENSION_META[d.dimension]?.label || d.dimension,
    leaderA: d.score_a,
    leaderB: d.score_b,
  }))

  const assessment = result.compatibility.overall_assessment
  const isLong = assessment.length > 120

  const totalScore = result.compatibility.overall_score
  const mitigations = result.recommendation?.mitigations || []
  const synergyBonuses = mitigations.map(m => m.score_increase || 0)
  const totalBonus = synergyBonuses.reduce((a, b) => a + b, 0)
  const potentialSynergy = Math.min(100, totalScore + totalBonus)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="card"
      style={{ padding: 32 }}
    >
      {/* Chart first — full width */}
      <div style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={420}>
          <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="62%">
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={<CustomAxisTick />}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tickCount={6}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
            />
            <Radar
              name={result.leader_a_name}
              dataKey="leaderA"
              stroke="#009ADA"
              fill="#009ADA"
              fillOpacity={0.3}
              isAnimationActive
              animationDuration={800}
            />
            <Radar
              name={result.leader_b_name}
              dataKey="leaderB"
              stroke="#81C4FF"
              fill="#81C4FF"
              fillOpacity={0.3}
              isAnimationActive
              animationDuration={800}
              animationBegin={200}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 13,
                color: 'var(--color-text)',
              }}
            />
          </RechartsRadar>
        </ResponsiveContainer>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginTop: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#009ADA' }} />
            {result.leader_a_name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#81C4FF' }} />
            {result.leader_b_name}
          </div>
        </div>
      </div>

      {/* Score + Assessment below */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: 24,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 24,
      }}>
        <div style={{ textAlign: 'center', flexShrink: 0, width: 150 }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 56,
            color: scoreColor,
            lineHeight: 1,
          }}>
            {score}
          </div>
          <div style={{
            fontSize: 13,
            color: 'var(--color-text)',
            marginTop: 6,
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
            opacity: 0.7,
          }}>
            Compatibility Score
          </div>

          {totalBonus > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ 
                display: 'flex', 
                height: 8, 
                background: 'var(--color-border)', 
                borderRadius: 4, 
                overflow: 'hidden', 
                marginBottom: 8 
              }}>
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${totalScore}%` }} 
                  transition={{ duration: 1, delay: 0.2 }}
                  style={{ background: scoreColor }} 
                />
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${Math.min(100 - totalScore, totalBonus)}%` }} 
                  transition={{ duration: 1, delay: 1.2 }}
                  style={{ 
                    background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.4), rgba(255,255,255,0.4) 4px, transparent 4px, transparent 8px)', 
                    backgroundColor: scoreColor, 
                    opacity: 0.6 
                  }} 
                />
              </div>
              <div style={{ 
                fontSize: 12, 
                color: 'var(--color-text-muted)', 
                fontFamily: 'var(--font-heading)', 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.3
              }}>
                Potential Synergy: <span style={{ color: 'var(--color-text)' }}>{potentialSynergy}</span>
              </div>
            </div>
          )}
        </div>

        <div
          style={{ flex: 1, cursor: isLong ? 'pointer' : 'default' }}
          onClick={() => isLong && setExpanded(!expanded)}
        >
          <div style={{
            fontSize: 15,
            color: 'var(--color-text)',
            lineHeight: 1.7,
            ...(!expanded && isLong ? {
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            } : {}),
          }}>
            {assessment}
          </div>

          {isLong && (
            <AnimatePresence>
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 8,
                  fontSize: 13,
                  color: 'var(--color-bmw-blue)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 500,
                }}
              >
                {expanded ? 'Show less' : 'Read full assessment'}
                <ChevronDown
                  size={14}
                  style={{
                    transition: 'transform 150ms ease',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  )
}
