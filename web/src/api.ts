export const API = (import.meta.env.VITE_API_URL as string) || 'https://timecashking-api.onrender.com'

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || ''
  return token ? { Authorization: 'Bearer ' + token } : {}
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(API.replace(/\/$/, '') + path, { credentials: 'include', headers: authHeaders() })
  return res.json()
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(API.replace(/\/$/, '') + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export async function apiPatch<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(API.replace(/\/$/, '') + path, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(API.replace(/\/$/, '') + path, { method: 'DELETE', credentials: 'include', headers: authHeaders() })
  return res.json()
}

export function normAmount(input: string) {
  let s = String(input || '').trim().replace(/\s+/g, '').replace(/,/g, '.')
  const p = s.split('.')
  if (p.length > 2) {
    const dec = p.pop()!
    s = p.join('') + '.' + dec
  }
  return s
}

