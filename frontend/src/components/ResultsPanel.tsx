import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import type { AnalysisResult } from '../types'
import { VerdictBanner } from './VerdictBanner'
import { CompatibilityRadar } from './RadarChart'
import { DimensionBreakdown } from './DimensionBreakdown'
import { ImpactBars } from './ImpactBars'
import { StrengthsConcernsPanel, MitigationsList } from './MitigationsPanel'

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

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function ProfileCard({ name, role, bio, color, delay }: {
  name: string
  role?: string
  bio?: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card"
      style={{
        flex: 1,
        padding: 24,
        borderTop: `3px solid ${color}`,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: bio ? 16 : 0 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 20,
          flexShrink: 0,
        }}>
          {getInitials(name)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 20,
            color: 'var(--color-text)',
          }}>
            {name}
          </div>
          {role && (
            <div style={{
              fontSize: 14,
              color: color,
              fontFamily: 'var(--font-heading)',
              fontWeight: 500,
            }}>
              {role}
            </div>
          )}
        </div>
      </div>

      {bio ? (
        <div style={{
          fontSize: 14,
          color: 'var(--color-text)',
          lineHeight: 1.7,
          opacity: 0.85,
          borderTop: '1px solid var(--color-border)',
          paddingTop: 14,
        }}>
          {bio}
        </div>
      ) : (
        <div style={{
          fontSize: 14,
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderTop: '1px solid var(--color-border)',
          paddingTop: 14,
          marginTop: 16,
        }}>
          <User size={14} />
          No bio available
        </div>
      )}
    </motion.div>
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
      {/* Leader Profiles */}
      <div>
        <SectionLabel>Leaders Analyzed</SectionLabel>
        <div style={{ display: 'flex', gap: 16 }}>
          <ProfileCard
            name={result.leader_a_name}
            role={result.leader_a_role}
            bio={result.leader_a_bio}
            color="var(--color-bmw-blue)"
            delay={0}
          />
          <ProfileCard
            name={result.leader_b_name}
            role={result.leader_b_role}
            bio={result.leader_b_bio}
            color="var(--color-ice-blue)"
            delay={0.1}
          />
        </div>
      </div>

      <VerdictBanner result={result} />

      <div>
        <SectionLabel>Compatibility & Mitigations</SectionLabel>
        <CompatibilityRadar result={result} />
        
        <div style={{ marginTop: 24 }}>
          <MitigationsList
            mitigations={result.recommendation.mitigations}
          />
        </div>
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
        <StrengthsConcernsPanel
          strengths={result.recommendation.strengths}
          concerns={result.recommendation.concerns}
        />
      </div>
    </motion.div>
  )
}
