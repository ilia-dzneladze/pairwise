import { useState, useRef } from 'react'
import type { AnalysisResult, StepEvent } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? ''

export function useAnalysis() {
  const [steps, setSteps] = useState<StepEvent[]>([])
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const analyze = async (leaderAId: string, leaderBId: string, presetId: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsAnalyzing(true)
    setSteps([])
    setResult(null)
    setError(null)

    try {
      const res = await fetch(`${BASE}/analyze/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leader_a: { leader_id: leaderAId },
          leader_b: { leader_id: leaderBId },
          scenario: { preset_id: presetId },
        }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`Analysis failed (HTTP ${res.status})`)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop()!
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const event = JSON.parse(line.slice(6))
            if ('error' in event) {
              setError(event.error)
              setIsAnalyzing(false)
              return
            }
            const stepEvent = event as StepEvent
            if (stepEvent.result) {
              setResult(stepEvent.result)
            }
            setSteps(prev => [...prev, stepEvent])
          }
        }
      }
    } catch (e) {
      if (controller.signal.aborted) return
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    setSteps([])
    setResult(null)
    setIsAnalyzing(false)
    setError(null)
  }

  return { analyze, steps, result, isAnalyzing, error, reset }
}
