import { useState, useEffect, useCallback } from 'react'
import type { Leader } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? ''

export function useLeaders() {
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_leaders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/leaders`)
      if (!res.ok) throw new Error('Failed to load leaders')
      const data = await res.json()
      setLeaders(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leaders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_leaders() }, [fetch_leaders])

  const addLeader = async (name: string, role: string, bio: string): Promise<Leader> => {
    const res = await fetch(`${BASE}/leaders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, bio }),
    })
    if (!res.ok) throw new Error(await res.text())
    const created = await res.json()
    await fetch_leaders()
    return created
  }

  return { leaders, loading, error, refetch: fetch_leaders, addLeader }
}
