import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { StepEvent } from '../types'

const TOTAL_STEPS = 6

interface Props {
  steps: StepEvent[]
  isAnalyzing: boolean
}

export function AnalysisProgress({ steps, isAnalyzing }: Props) {
  const currentStep = steps.length
  const allLabels = [
    'Profiling Leader A...',
    'Profiling Leader B...',
    'Analyzing compatibility...',
    'Calibrating scenario weights...',
    'Projecting business impact...',
    'Synthesizing recommendation...',
  ]

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const stepNum = i + 1
          const stepData = steps[i]
          const isCompleted = stepNum < currentStep || (stepNum === currentStep && !isAnalyzing)
          const isActive = stepNum === currentStep && isAnalyzing
          const isPending = stepNum > currentStep

          const label = stepData?.message || allLabels[i]

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: isPending ? 0.4 : 1,
              }}
            >
              {/* Status indicator */}
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                ...(isCompleted ? {
                  background: 'var(--color-success)',
                } : isActive ? {
                  background: 'var(--color-bmw-blue)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                } : {
                  border: '2px solid var(--color-text-muted)',
                }),
              }}>
                {isCompleted && <Check size={14} color="#fff" strokeWidth={3} />}
                {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>

              {/* Step info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 500,
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                }}>
                  Step {stepNum}/{TOTAL_STEPS}
                </span>
                <span style={{
                  fontSize: 14,
                  color: isPending ? 'var(--color-text-muted)' : 'var(--color-text)',
                }}>
                  {label}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 154, 218, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(0, 154, 218, 0); }
        }
      `}</style>
    </div>
  )
}
