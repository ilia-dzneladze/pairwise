import { useState, useEffect } from 'react'
import type { Scenario } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? ''

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/scenarios`)
        if (!res.ok) throw new Error('Failed to load scenarios')
        setScenarios(await res.json())
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load scenarios')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return { scenarios, loading, error }
}
