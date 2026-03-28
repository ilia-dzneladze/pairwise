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
import { motion } from 'framer-motion'
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

function CustomAxisTick({ x, y, payload }: any) {
  const dim = Object.entries(DIMENSION_META).find(([, v]) => v.label === payload.value)
  const meta = dim?.[1]

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor="middle"
        fill="var(--color-text)"
        fontSize={12}
        fontFamily="var(--font-heading)"
        fontWeight={500}
        dy={0}
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
  const score = useCountUp(result.compatibility.overall_score)

  const data = result.compatibility.dimensions.map(d => ({
    dimension: DIMENSION_META[d.dimension]?.label || d.dimension,
    leaderA: d.score_a,
    leaderB: d.score_b,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="card"
      style={{ padding: 32 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'center' }}>
        {/* Score display */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 64,
            color: 'var(--color-bmw-blue)',
            lineHeight: 1,
          }}>
            {score}
          </div>
          <div style={{
            fontSize: 14,
            color: 'var(--color-text-muted)',
            marginTop: 8,
            marginBottom: 16,
          }}>
            Compatibility Score
          </div>
          <div style={{
            fontSize: 14,
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {result.compatibility.overall_assessment}
          </div>
        </div>

        {/* Radar chart */}
        <div>
          <ResponsiveContainer width="100%" height={320}>
            <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="75%">
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
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#009ADA' }} />
              {result.leader_a_name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#81C4FF' }} />
              {result.leader_b_name}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
