export async function fetchAPI(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `API Error: ${res.status}`);
  }
  
  return res.json();
}
