const BASE = process.env.REACT_APP_API_URL || '';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  getTrends: (category = 'all') => req(`/api/trends?category=${category}`),
  generate:  (body)             => req('/api/generate', { method: 'POST', body: JSON.stringify(body) }),
  getStatus: (jobId)            => req(`/api/status/${jobId}`),
  getJobs:   ()                 => req('/api/jobs'),
  downloadUrl: (jobId)          => `${BASE}/api/download/${jobId}`,
};
