import { useState, useEffect } from 'react'
import type { Scenario } from '../types'
import { api } from '../api'

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getScenarios()
        setScenarios(res)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load scenarios')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function addScenario(name: string, description: string) {
    const newScenario = await api.createScenario(name, description)
    setScenarios(prev => [...prev, newScenario])
  }

  return { scenarios, loading, error, addScenario }
}
