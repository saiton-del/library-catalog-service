const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchJson(path, options = {}) {
  const isSignal = typeof AbortSignal !== 'undefined' && options instanceof AbortSignal;
  const { signal, ...requestOptions } = isSignal ? { signal: options } : options;
  const headers = new Headers(requestOptions.headers || {});
  const request = {
    ...requestOptions,
    signal,
    credentials: 'include',
    headers,
  };

  if (requestOptions.body && typeof requestOptions.body !== 'string') {
    headers.set('Content-Type', 'application/json');
    request.body = JSON.stringify(requestOptions.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, request);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const fieldErrors = Array.isArray(body?.fields)
      ? body.fields.map((item) => `${item.field}: ${item.message}`).join(' ')
      : '';
    throw new Error(fieldErrors || body?.error || `Request failed (${response.status}).`);
  }
  return body;
}
