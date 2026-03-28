import { motion } from 'framer-motion'
import type { AnalysisResult } from '../types'
import { VerdictBanner } from './VerdictBanner'
import { CompatibilityRadar } from './RadarChart'
import { DimensionBreakdown } from './DimensionBreakdown'
import { ImpactBars } from './ImpactBars'
import { MitigationsPanel } from './MitigationsPanel'

interface Props {
  result: AnalysisResult
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: 24,
      marginBottom: 16,
    }}>
      {children}
    </h3>
  )
}

export function ResultsPanel({ result }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
    >
      <VerdictBanner result={result} />

      <div>
        <SectionLabel>Compatibility</SectionLabel>
        <CompatibilityRadar result={result} />
      </div>

      <div>
        <SectionLabel>Dimension Breakdown</SectionLabel>
        <DimensionBreakdown
          dimensions={result.compatibility.dimensions}
          leaderAName={result.leader_a_name}
          leaderBName={result.leader_b_name}
        />
      </div>

      <div>
        <SectionLabel>Business Impact</SectionLabel>
        <ImpactBars impact={result.impact} />
      </div>

      <div>
        <SectionLabel>Assessment</SectionLabel>
        <MitigationsPanel
          strengths={result.recommendation.strengths}
          concerns={result.recommendation.concerns}
          mitigations={result.recommendation.mitigations}
        />
      </div>
    </motion.div>
  )
}
