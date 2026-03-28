import { motion } from 'framer-motion'
import type { Mitigation } from '../types'

interface Props {
  mitigations: Mitigation[]
  strengths: string[]
  concerns: string[]
}

export function MitigationsPanel({ mitigations, strengths, concerns }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Strengths & Concerns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card card--accent-green"
          style={{ padding: 20 }}
        >
          <h4 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 12,
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            Strengths
          </h4>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {strengths.map((s, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--color-text)' }}>
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card card--accent-red"
          style={{ padding: 20 }}
        >
          <h4 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 12,
            color: 'var(--color-alert-red)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            Concerns
          </h4>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {concerns.map((c, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--color-text)' }}>
                {c}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Mitigations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="card card--accent-blue"
        style={{ padding: 24 }}
      >
        <h4 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 16,
          color: 'var(--color-bmw-blue)',
        }}>
          Mitigations
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {mitigations.map((m, i) => (
            <div key={i}>
              {i > 0 && (
                <div style={{
                  height: 1,
                  background: 'var(--color-border)',
                  margin: '16px 0',
                }} />
              )}
              <div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 500,
                  }}>
                    Friction Area
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>
                    {m.friction_area}
                  </div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 500,
                  }}>
                    Suggestion
                  </span>
                  <div style={{ fontSize: 14, marginTop: 2, lineHeight: 1.5 }}>
                    {m.suggestion}
                  </div>
                </div>
                <div>
                  <span style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 500,
                  }}>
                    Expected Effect
                  </span>
                  <div style={{ fontSize: 14, marginTop: 2, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {m.expected_effect}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
