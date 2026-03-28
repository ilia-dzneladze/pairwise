import { useState } from 'react'
import { api } from './api'
import './App.css'

const LEADERS = [
  { id: 'leader-01', name: 'Dr. Katarina Vogel' },
  { id: 'leader-02', name: 'Marcus Einhorn' },
  { id: 'leader-03', name: 'Sarah Chen' },
  { id: 'leader-04', name: 'Friedrich Braun' },
  { id: 'leader-05', name: 'Amara Osei' },
  { id: 'leader-06', name: 'Henrik Larsson' },
  { id: 'leader-07', name: 'Priya Kapoor' },
  { id: 'leader-08', name: 'Thomas Weber' },
]

function App() {
  const [leaderId, setLeaderId] = useState('leader-01')
  const [result, setResult] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runProfile() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await api.profile(leaderId)
      setResult(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>PairWise — Profile Structurer</h1>
      <p style={{ color: '#666' }}>Test the backend by running Agent 1 on a leader.</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <select
          value={leaderId}
          onChange={e => setLeaderId(e.target.value)}
          style={{ padding: '8px 12px', fontSize: 16, flex: 1 }}
        >
          {LEADERS.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <button
          onClick={runProfile}
          disabled={loading}
          style={{ padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}
        >
          {loading ? 'Running…' : 'Run Profile'}
        </button>
      </div>

      {error && (
        <pre style={{ background: '#fee', padding: 16, borderRadius: 8, color: '#c00' }}>
          {error}
        </pre>
      )}

      {result !== null && (
        <pre style={{ background: '#f4f4f4', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 13 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default App
