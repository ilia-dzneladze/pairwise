const BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type Leader = { id: string; name: string; role: string };
export type Scenario = { id: string; name: string; description: string };

export type FullAnalysis = {
  leader_a_name: string;
  leader_b_name: string;
  scenario_name: string;
  compatibility: {
    overall_score: number;
    overall_assessment: string;
    dimensions: {
      dimension: string;
      score_a: number;
      score_b: number;
      delta: number;
      interaction: 'synergy' | 'neutral' | 'friction';
      reasoning: string;
    }[];
  };
  impact: {
    execution_speed: { score: number; confidence: string; reasoning: string };
    team_morale: { score: number; confidence: string; reasoning: string };
    innovation_rate: { score: number; confidence: string; reasoning: string };
    quality_control: { score: number; confidence: string; reasoning: string };
  };
  recommendation: {
    verdict: 'strong_pair' | 'proceed_with_caution' | 'high_risk';
    headline: string;
    strengths: string[];
    concerns: string[];
    mitigations: { friction_area: string; suggestion: string; expected_effect: string }[];
    alternative_suggestion: string | null;
  };
};

export type StreamEvent =
  | { step: number; total: number; message: string; result?: undefined }
  | { step: number; total: number; message: string; result: FullAnalysis }
  | { error: string };

export const api = {
  getLeaders: () => request<Leader[]>('/leaders'),
  getScenarios: () => request<Scenario[]>('/scenarios'),

  streamAnalyze: (
    leader_a_id: string,
    leader_b_id: string,
    preset_id: string,
    onEvent: (e: StreamEvent) => void,
  ) => {
    const url = `${BASE}/analyze/stream`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leader_a_id, leader_b_id, scenario: { preset_id } }),
    }).then(async (res) => {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            onEvent(JSON.parse(line.slice(6)));
          }
        }
      }
    });
  },
};
