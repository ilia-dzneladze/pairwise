import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, ArrowRight, Diamond, RefreshCw } from 'lucide-react'
import { useLeaders } from './hooks/useLeaders'
import { useScenarios } from './hooks/useScenarios'
import { useAnalysis } from './hooks/useAnalysis'
import { LeaderSelector } from './components/LeaderSelector'
import { ScenarioSelector } from './components/ScenarioSelector'
import { AddLeaderModal } from './components/AddLeaderModal'
import { AnalysisProgress } from './components/AnalysisProgress'
import { ResultsPanel } from './components/ResultsPanel'
import type { Leader } from './types'

export default function App() {
  const { leaders, error: leadersError, addLeader } = useLeaders()
  const { scenarios, error: scenariosError } = useScenarios()
  const { analyze, steps, result, isAnalyzing, error: analysisError, reset } = useAnalysis()

  const [leaderA, setLeaderA] = useState<Leader | null>(null)
  const [leaderB, setLeaderB] = useState<Leader | null>(null)
  const [scenarioId, setScenarioId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const resultsRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const sameLeader = leaderA && leaderB && leaderA.id === leaderB.id
  const canAnalyze = leaderA && leaderB && scenarioId && !sameLeader && !isAnalyzing

  const backendError = leadersError || scenariosError

  // Auto-select first scenario when loaded
  useEffect(() => {
    if (scenarios.length > 0 && !scenarioId) {
      setScenarioId(scenarios[0].id)
    }
  }, [scenarios, scenarioId])

  // Scroll to progress when analysis starts
  useEffect(() => {
    if (isAnalyzing && progressRef.current) {
      progressRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isAnalyzing])

  // Scroll to results when complete
  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [result])

  function handleAnalyze() {
    if (!canAnalyze) return
    reset()
    analyze(leaderA.id, leaderB.id, scenarioId)
  }

  async function handleAddLeader(name: string, role: string, bio: string) {
    await addLeader(name, role, bio)
    setShowModal(false)
    setToast('Leader added successfully')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 64px' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'var(--color-surface)',
        padding: '16px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 32,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Diamond size={16} fill="var(--color-bmw-blue)" color="var(--color-bmw-blue)" />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 20,
              color: 'var(--color-text)',
            }}>
              PairWise
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Multi-Agent Leadership Intelligence
          </div>
        </div>
        <button className="btn btn--outline" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Leader
        </button>
      </header>

      {/* Backend error banner */}
      {backendError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card card--accent-red"
          style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span style={{ fontSize: 14 }}>Could not reach the PairWise backend. Please try again.</span>
          <button className="btn btn--ghost" onClick={() => window.location.reload()}>
            <RefreshCw size={14} /> Retry
          </button>
        </motion.div>
      )}

      {/* Leader Selection */}
      <section style={{ marginBottom: 32 }}>
        <LeaderSelector
          leaders={leaders}
          leaderA={leaderA}
          leaderB={leaderB}
          onSelectA={setLeaderA}
          onSelectB={setLeaderB}
        />
      </section>

      {/* Scenario Selection */}
      <section style={{ marginBottom: 32 }}>
        <ScenarioSelector
          scenarios={scenarios}
          selected={scenarioId}
          onSelect={setScenarioId}
        />
      </section>

      {/* Analyze Button */}
      <section style={{ marginBottom: 32 }}>
        <button
          className="btn btn--primary"
          disabled={!canAnalyze}
          onClick={handleAnalyze}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Pairing'}
          {!isAnalyzing && <ArrowRight size={18} />}
        </button>
      </section>

      {/* Analysis Error */}
      {analysisError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card card--accent-red"
          style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span style={{ fontSize: 14 }}>{analysisError}</span>
          <button className="btn btn--ghost" onClick={handleAnalyze}>
            <RefreshCw size={14} /> Retry Analysis
          </button>
        </motion.div>
      )}

      {/* Progress */}
      <AnimatePresence>
        {(isAnalyzing || (steps.length > 0 && !result)) && (
          <motion.div
            ref={progressRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: 32 }}
          >
            <AnalysisProgress steps={steps} isAnalyzing={isAnalyzing} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <div ref={resultsRef}>
            <ResultsPanel result={result} />
          </div>
        )}
      </AnimatePresence>

      {/* Add Leader Modal */}
      <AnimatePresence>
        {showModal && (
          <AddLeaderModal
            onClose={() => setShowModal(false)}
            onAdd={handleAddLeader}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
