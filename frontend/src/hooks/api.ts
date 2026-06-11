const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (res.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('unauthorized')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || `Request failed (${res.status})`)
  }
  return res
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path)
  return res.json()
}

export async function apiPost(path: string, body?: unknown): Promise<unknown> {
  const res = await apiFetch(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export async function apiPut(path: string, body?: unknown): Promise<unknown> {
  const res = await apiFetch(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export async function apiDelete(path: string, body?: unknown): Promise<unknown> {
  const res = await apiFetch(path, {
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}
