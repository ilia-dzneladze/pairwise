import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react'
import type { AnalysisResult } from '../types'
import { VERDICT_CONFIG } from '../types'

interface Props {
  result: AnalysisResult
}

const VERDICT_ICON = {
  strong_pair: ShieldCheck,
  proceed_with_caution: AlertTriangle,
  high_risk: ShieldAlert,
}

export function VerdictBanner({ result }: Props) {
  const { verdict, headline, alternative_suggestion } = result.recommendation
  const config = VERDICT_CONFIG[verdict]
  const Icon = VERDICT_ICON[verdict]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card"
        style={{
          borderLeft: `4px solid ${config.color}`,
          padding: '32px 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Icon size={28} style={{ color: config.color }} />
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 36,
            color: config.color,
            lineHeight: 1,
          }}>
            {config.label}
          </span>
        </div>

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 18,
          color: 'var(--color-text)',
          marginBottom: 16,
          fontStyle: 'italic',
        }}>
          &ldquo;{headline}&rdquo;
        </div>

        <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
          {result.leader_a_name} &times; {result.leader_b_name}
          <span style={{ margin: '0 8px' }}>&middot;</span>
          {result.scenario_name}
        </div>
      </motion.div>

      {alternative_suggestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          style={{
            background: 'rgba(231, 34, 46, 0.1)',
            border: '1px solid rgba(231, 34, 46, 0.3)',
            borderRadius: 12,
            padding: '16px 20px',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--color-alert-red)',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Alternative Suggestion
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-text)' }}>
            {alternative_suggestion}
          </div>
        </motion.div>
      )}
    </div>
  )
}
