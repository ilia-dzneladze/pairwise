import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { FileUploader } from './FileUploader'
import type { Scenario } from '../types'

interface Props {
  scenarios: Scenario[]
  onClose: () => void
  onAdd: (name: string, description: string) => Promise<void>
}

export function AddScenarioModal({ scenarios, onClose, onAdd }: Props) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | 'NEW'>('NEW')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!description.trim()) e.description = 'Description is required'
    else if (description.trim().length < 20) e.description = 'Description must be at least 20 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      await onAdd(name.trim(), description.trim())
      setName('')
      setDescription('')
      // After adding, select the newly added scenario or close. Parent will show toast.
      onClose()
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to add scenario' })
    } finally {
      setLoading(false)
    }
  }

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 800,
          maxWidth: '90vw',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 20, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            Library & Add Scenario
          </h3>
          <button onClick={onClose} className="btn btn--ghost" style={{ padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: 400 }}>
          {/* Left Column */}
          <div style={{ borderRight: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', padding: 16, overflowY: 'auto' }}>
            <button
              onClick={() => setSelectedScenarioId('NEW')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                background: selectedScenarioId === 'NEW' ? 'var(--color-card-hover)' : 'var(--color-card)',
                border: selectedScenarioId === 'NEW' ? '1px solid var(--color-bmw-blue)' : '1px dashed var(--color-border)',
                borderRadius: 8,
                color: 'var(--color-text)',
                cursor: 'pointer',
                marginBottom: 16,
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} /> Create New
            </button>

            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600 }}>AVAILABLE SCENARIOS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scenarios.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelectedScenarioId(s.id)}
                  style={{
                    padding: '12px 16px',
                    background: selectedScenarioId === s.id ? 'var(--color-card-hover)' : 'transparent',
                    border: '1px solid',
                    borderColor: selectedScenarioId === s.id ? 'var(--color-border)' : 'transparent',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: 'var(--color-text)',
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ padding: 24, overflowY: 'auto' }}>
            {selectedScenarioId === 'NEW' ? (
              <div>
                <h4 style={{ fontSize: 18, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Create Custom Scenario</h4>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    Scenario Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Post-Merger Integration"
                  />
                  {errors.name && <div style={{ color: 'var(--color-alert-red)', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    Upload Scenario Document (PDF / DOCX)
                  </label>
                  <FileUploader onTextExtracted={setDescription} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    Scenario Context / Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the business situation, challenges, and goals..."
                    rows={6}
                    style={{ resize: 'vertical' }}
                  />
                  {errors.description && <div style={{ color: 'var(--color-alert-red)', fontSize: 12, marginTop: 4 }}>{errors.description}</div>}
                </div>

                {errors.submit && (
                  <div style={{ color: 'var(--color-alert-red)', fontSize: 13, marginBottom: 16 }}>
                    {errors.submit}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn--primary"
                >
                  {loading ? 'Analyzing Context & Saving...' : 'Save Scenario'}
                </button>
              </div>
            ) : selectedScenario ? (
              <div>
                <h4 style={{ fontSize: 20, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>{selectedScenario.name}</h4>
                <div style={{ 
                  background: 'var(--color-card)', 
                  padding: 20, 
                  borderRadius: 12, 
                  border: '1px solid var(--color-border)',
                  lineHeight: 1.6,
                  color: 'var(--color-text)',
                  fontSize: 15
                }}>
                  {selectedScenario.description}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
