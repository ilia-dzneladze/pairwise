import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { FileUploader } from './FileUploader'

interface Props {
  onClose: () => void
  onAdd: (name: string, role: string, bio: string) => Promise<void>
}

export function AddLeaderModal({ onClose, onAdd }: Props) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!role.trim()) e.role = 'Role is required'
    if (!bio.trim()) e.bio = 'Bio is required'
    else if (bio.trim().length < 50) e.bio = 'Bio must be at least 50 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      await onAdd(name.trim(), role.trim(), bio.trim())
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to add leader' })
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            Add Leader
          </h3>
          <button onClick={onClose} className="btn btn--ghost" style={{ padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jane Smith"
            />
            {errors.name && <div style={{ color: 'var(--color-alert-red)', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              Role / Title
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Chief Revenue Officer"
            />
            {errors.role && <div style={{ color: 'var(--color-alert-red)', fontSize: 12, marginTop: 4 }}>{errors.role}</div>}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
            Upload CV (PDF / DOCX)
          </label>
          <FileUploader onTextExtracted={setBio} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>
            Bio / CV Text
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Paste bio text or upload a file above..."
            rows={6}
            style={{ resize: 'vertical' }}
          />
          {errors.bio && <div style={{ color: 'var(--color-alert-red)', fontSize: 12, marginTop: 4 }}>{errors.bio}</div>}
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
          {loading ? 'Saving...' : 'Save Leader'}
        </button>
      </motion.div>
    </div>
  )
}
