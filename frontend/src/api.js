const fallbackBase = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://smart-medical-store-backend.onrender.com';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || fallbackBase).replace(/\/$/, '');

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await parseResponse(response).catch(() => null);

  if (!response.ok) {
    const message = typeof data === 'string'
      ? data
      : data?.message || data?.error || response.statusText || `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return data;
}