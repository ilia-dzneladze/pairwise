import { motion } from 'framer-motion'
import type { Mitigation } from '../types'

interface Props {
  mitigations: Mitigation[]
  strengths: string[]
  concerns: string[]
}

function formatFrictionArea(area: string) {
  return area.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export function StrengthsConcernsPanel({ strengths, concerns }: Omit<Props, 'mitigations'>) {
  return (
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
        }}>
          Strengths
        </h4>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {strengths.map((s, i) => (
            <li key={i} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-text)' }}>
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
        }}>
          Concerns
        </h4>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {concerns.map((c, i) => (
            <li key={i} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-text)' }}>
              {c}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}

export function MitigationsList({ mitigations }: Omit<Props, 'strengths' | 'concerns'>) {
  return (
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
        Potential Mitigations
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {mitigations.map((m, i) => (
          <div key={i}>
            {i > 0 && (
              <div style={{
                height: 1,
                background: 'var(--color-border)',
                margin: '24px 0',
              }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <span style={{
                  fontSize: 12,
                  color: 'var(--color-bmw-blue)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                }}>
                  Friction Area
                </span>
                <div style={{ fontSize: 17, fontWeight: 600, marginTop: 3, color: 'var(--color-text)' }}>
                  {formatFrictionArea(m.friction_area)}
                </div>
              </div>
              
              <div style={{
                background: 'var(--color-card-hover)',
                borderLeft: '4px solid var(--color-amber)',
                padding: '16px',
                borderRadius: '0 8px 8px 0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--color-amber)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                  }}>
                    Suggestion
                  </div>
                  {typeof m.score_increase === 'number' && m.score_increase > 0 && (
                    <div style={{
                      fontSize: 12,
                      color: 'var(--color-success)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-heading)',
                      background: 'rgba(39, 174, 96, 0.1)',
                      padding: '2px 8px',
                      borderRadius: 12,
                    }}>
                      +{m.score_increase} Synergy
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 15, color: 'var(--color-text)', lineHeight: 1.6, fontWeight: 500 }}>
                  {m.suggestion}
                </div>
              </div>

              <div style={{
                background: 'var(--color-card-hover)',
                borderLeft: '4px solid var(--color-success)',
                padding: '16px',
                borderRadius: '0 8px 8px 0',
              }}>
                <div style={{
                  fontSize: 12,
                  color: 'var(--color-success)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  marginBottom: 6,
                }}>
                  Expected Effect
                </div>
                <div style={{ fontSize: 15, color: 'var(--color-text)', lineHeight: 1.6, fontWeight: 500 }}>
                  {m.expected_effect}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
