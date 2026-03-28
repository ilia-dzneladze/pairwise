const BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  getLeaders: () =>
    request<{ id: string; name: string; role: string }[]>('/leaders'),

  getScenarios: () =>
    request<{ id: string; name: string; description: string }[]>('/scenarios'),

  analyze: (leader_a_id: string, leader_b_id: string, scenario: object) =>
    request<unknown>('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leader_a_id, leader_b_id, scenario }),
    }),

  profile: (leader_id: string) =>
    request<unknown>('/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leader_id }),
    }),

  health: () =>
    request<{ status: string }>('/health'),
};
