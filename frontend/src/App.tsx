import { useEffect, useState } from 'react'
import { api } from './api'
import type { FullAnalysis, Leader, Scenario, StreamEvent } from './api'

const VERDICT_LABEL = {
  strong_pair: '✅ Strong Pair',
  proceed_with_caution: '⚠️ Proceed with Caution',
  high_risk: '🚨 High Risk',
}

export default function App() {
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [leaderA, setLeaderA] = useState('')
  const [leaderB, setLeaderB] = useState('')
  const [scenarioId, setScenarioId] = useState('')
  const [steps, setSteps] = useState<string[]>([])
  const [result, setResult] = useState<FullAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // CV import state
  const [showCvForm, setShowCvForm] = useState(false)
  const [cvName, setCvName] = useState('')
  const [cvRole, setCvRole] = useState('')
  const [cvBio, setCvBio] = useState('')
  const [cvLoading, setCvLoading] = useState(false)
  const [cvError, setCvError] = useState<string | null>(null)
  const [cvSuccess, setCvSuccess] = useState<string | null>(null)

  function refreshLeaders() {
    api.getLeaders().then(setLeaders)
  }

  useEffect(() => {
    api.getLeaders().then((l) => { setLeaders(l); setLeaderA(l[0]?.id); setLeaderB(l[1]?.id) })
    api.getScenarios().then((s) => { setScenarios(s); setScenarioId(s[0]?.id) })
  }, [])

  async function submitCv() {
    if (!cvName.trim() || !cvRole.trim() || !cvBio.trim()) {
      setCvError('Name, role, and CV text are all required')
      return
    }
    setCvLoading(true)
    setCvError(null)
    setCvSuccess(null)
    try {
      const created = await api.createLeader(cvName.trim(), cvRole.trim(), cvBio.trim())
      setCvSuccess(`Created "${created.name}" (${created.id})`)
      setCvName(''); setCvRole(''); setCvBio('')
      setShowCvForm(false)
      refreshLeaders()
    } catch (e) {
      setCvError(String(e))
    } finally {
      setCvLoading(false)
    }
  }

  function runAnalysis() {
    if (!leaderA || !leaderB || !scenarioId) return
    if (leaderA === leaderB) { setError('Select two different leaders'); return }
    setLoading(true)
    setError(null)
    setResult(null)
    setSteps([])

    api.streamAnalyze(leaderA, leaderB, scenarioId, (e: StreamEvent) => {
      if ('error' in e) {
        setError(e.error)
        setLoading(false)
        return
      }
      setSteps((prev) => [...prev, e.message])
      if (e.result) {
        setResult(e.result)
        setLoading(false)
      }
    })
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>PairWise</h1>
      <p style={{ color: '#666', marginTop: 0 }}>Multi-agent leadership pairing analysis</p>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Leader A</label>
          <select value={leaderA} onChange={e => setLeaderA(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            {leaders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Leader B</label>
          <select value={leaderB} onChange={e => setLeaderB(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            {leaders.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Scenario</label>
          <select value={scenarioId} onChange={e => setScenarioId(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={runAnalysis} disabled={loading} style={{ padding: '8px 20px', cursor: 'pointer', height: 36 }}>
            {loading ? 'Running…' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* CV import */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => { setShowCvForm(!showCvForm); setCvError(null); setCvSuccess(null) }}
          style={{ fontSize: 13, padding: '4px 12px', cursor: 'pointer' }}>
          {showCvForm ? '✕ Cancel' : '+ Add Leader from CV'}
        </button>
        {cvSuccess && <span style={{ marginLeft: 12, color: 'green', fontSize: 13 }}>{cvSuccess}</span>}

        {showCvForm && (
          <div style={{ marginTop: 12, padding: 16, border: '1px solid #ddd', borderRadius: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Full Name</label>
                <input value={cvName} onChange={e => setCvName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  style={{ width: '100%', padding: '7px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Role / Title</label>
                <input value={cvRole} onChange={e => setCvRole(e.target.value)}
                  placeholder="e.g. Chief Revenue Officer"
                  style={{ width: '100%', padding: '7px', boxSizing: 'border-box' }} />
              </div>
            </div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>CV / Bio Text</label>
            <textarea value={cvBio} onChange={e => setCvBio(e.target.value)}
              placeholder="Paste the full CV or biography here..."
              rows={6}
              style={{ width: '100%', padding: '7px', boxSizing: 'border-box', fontFamily: 'sans-serif' }} />
            {cvError && <p style={{ color: 'red', margin: '8px 0 0' }}>{cvError}</p>}
            <button onClick={submitCv} disabled={cvLoading}
              style={{ marginTop: 10, padding: '8px 20px', cursor: 'pointer' }}>
              {cvLoading ? 'Saving…' : 'Save Leader'}
            </button>
          </div>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Progress steps */}
      {steps.length > 0 && (
        <div style={{ marginBottom: 24, padding: 12, background: '#f8f8f8', borderRadius: 6 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: i === steps.length - 1 && loading ? '#333' : '#888' }}>
              {i === steps.length - 1 && loading ? '⏳' : '✓'} {s}
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          {/* Verdict */}
          <h2 style={{ marginBottom: 4 }}>
            {VERDICT_LABEL[result.recommendation.verdict]}
          </h2>
          <p style={{ marginTop: 0, fontSize: 18 }}>{result.recommendation.headline}</p>
          <p style={{ color: '#555' }}>
            <strong>{result.leader_a_name}</strong> + <strong>{result.leader_b_name}</strong> — {result.scenario_name}
          </p>

          {/* Compatibility score */}
          <div style={{ marginBottom: 24 }}>
            <strong>Overall compatibility: {result.compatibility.overall_score}/100</strong>
            <p style={{ margin: '4px 0', color: '#555' }}>{result.compatibility.overall_assessment}</p>
          </div>

          {/* Dimensions table */}
          <h3>Compatibility by Dimension</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Dimension</th>
                <th style={{ padding: '6px 8px' }}>{result.leader_a_name.split(' ')[0]}</th>
                <th style={{ padding: '6px 8px' }}>{result.leader_b_name.split(' ')[0]}</th>
                <th style={{ padding: '6px 8px' }}>Interaction</th>
                <th style={{ padding: '6px 8px' }}>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {result.compatibility.dimensions.map((d) => (
                <tr key={d.dimension} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 8px' }}>{d.dimension.replace('_', ' ')}</td>
                  <td style={{ padding: '6px 8px' }}>{d.score_a}</td>
                  <td style={{ padding: '6px 8px' }}>{d.score_b}</td>
                  <td style={{ padding: '6px 8px' }}>
                    {d.interaction === 'synergy' ? '🟢' : d.interaction === 'neutral' ? '🟡' : '🔴'} {d.interaction}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#555' }}>{d.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Impact */}
          <h3>Business Impact Projection</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {Object.entries(result.impact).map(([key, val]) => (
              <div key={key} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{key.replace('_', ' ')}</div>
                <div style={{ fontSize: 22, fontWeight: 'bold' }}>{val.score}<span style={{ fontSize: 14, fontWeight: 'normal' }}>/100</span></div>
                <div style={{ fontSize: 12, color: '#888' }}>confidence: {val.confidence}</div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{val.reasoning}</div>
              </div>
            ))}
          </div>

          {/* Strengths & Concerns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div>
              <h3>Strengths</h3>
              <ul>{result.recommendation.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
            <div>
              <h3>Concerns</h3>
              <ul>{result.recommendation.concerns.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          </div>

          {/* Mitigations */}
          <h3>Mitigations</h3>
          {result.recommendation.mitigations.map((m, i) => (
            <div key={i} style={{ marginBottom: 12, padding: 12, background: '#f8f8f8', borderRadius: 6 }}>
              <strong>{m.friction_area}</strong>
              <p style={{ margin: '4px 0' }}>{m.suggestion}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Expected: {m.expected_effect}</p>
            </div>
          ))}

          {/* Alternative suggestion */}
          {result.recommendation.alternative_suggestion && (
            <div style={{ marginTop: 16, padding: 12, background: '#fff3cd', borderRadius: 6 }}>
              <strong>Alternative suggestion:</strong> {result.recommendation.alternative_suggestion}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
