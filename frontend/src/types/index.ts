export interface Leader {
  id: string
  name: string
  role: string
  bio?: string
}

export interface Scenario {
  id: string
  name: string
  description: string
}

export interface DimensionResult {
  dimension: 'decision_style' | 'risk_appetite' | 'communication_mode' | 'execution_pace' | 'change_orientation'
  score_a: number
  score_b: number
  delta: number
  interaction: 'synergy' | 'neutral' | 'friction'
  reasoning: string
}

export interface ImpactScore {
  dimension?: string
  score: number
  confidence: 'low' | 'medium' | 'high'
  reasoning: string
}

export interface Mitigation {
  friction_area: string
  suggestion: string
  expected_effect: string
}

export interface CompatibilityReport {
  leader_a_id?: string
  leader_b_id?: string
  leader_a_name?: string
  leader_b_name?: string
  overall_score: number
  overall_assessment: string
  dimensions: DimensionResult[]
}

export interface ImpactProjection {
  execution_speed: ImpactScore
  team_morale: ImpactScore
  innovation_rate: ImpactScore
  quality_control: ImpactScore
}

export interface Recommendation {
  verdict: 'strong_pair' | 'proceed_with_caution' | 'high_risk'
  headline: string
  strengths: string[]
  concerns: string[]
  mitigations: Mitigation[]
  alternative_suggestion: string | null
}

export interface AnalysisResult {
  leader_a_name: string
  leader_b_name: string
  scenario_name: string
  compatibility: CompatibilityReport
  impact: ImpactProjection
  recommendation: Recommendation
}

export interface StepEvent {
  step: number
  total: number
  message: string
  result?: AnalysisResult
}

export interface StreamError {
  error: string
}

export type StreamEvent = StepEvent | StreamError

export const DIMENSION_META: Record<string, { label: string; low: string; high: string; lowDesc: string; highDesc: string }> = {
  decision_style: {
    label: 'Decision Style',
    low: 'Directive',
    high: 'Collaborative',
    lowDesc: 'Makes decisions top-down with minimal input. Values speed and clarity of command.',
    highDesc: 'Seeks broad input and shared ownership of decisions. Values alignment and buy-in.',
  },
  risk_appetite: {
    label: 'Risk Appetite',
    low: 'Conservative',
    high: 'Aggressive',
    lowDesc: 'Favors proven approaches, thorough validation, and incremental change.',
    highDesc: 'Embraces bold bets, tolerates failure, and pushes boundaries to move fast.',
  },
  communication_mode: {
    label: 'Communication',
    low: 'Top-Down',
    high: 'Consensus',
    lowDesc: 'Cascades information through hierarchy. Clear chain of command for messaging.',
    highDesc: 'Open forums, cross-functional transparency, and collective sense-making.',
  },
  execution_pace: {
    label: 'Execution Pace',
    low: 'Deliberate',
    high: 'Fast',
    lowDesc: 'Methodical planning, thorough review cycles, and careful rollout.',
    highDesc: 'Rapid iteration, bias toward action, and willingness to course-correct on the fly.',
  },
  change_orientation: {
    label: 'Change Drive',
    low: 'Stability',
    high: 'Transformation',
    lowDesc: 'Prioritizes continuity, process optimization, and protecting what works.',
    highDesc: 'Actively disrupts the status quo, drives reinvention, and champions new models.',
  },
}

export const VERDICT_CONFIG: Record<Recommendation['verdict'], { label: string; color: string }> = {
  strong_pair: { label: 'STRONG PAIR', color: 'var(--color-success)' },
  proceed_with_caution: { label: 'PROCEED WITH CAUTION', color: 'var(--color-amber)' },
  high_risk: { label: 'HIGH RISK', color: 'var(--color-alert-red)' },
}
