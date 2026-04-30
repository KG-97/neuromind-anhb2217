export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || '';

export async function apiPost<T = any>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let message = text;
    try {
      const json = JSON.parse(text || '{}');
      message = json.error || json.message || text;
    } catch {
      // ignore parse errors
    }
    throw new Error(`API request failed: ${response.status} ${response.statusText} ${message}`);
  }

  return response.json();
}
