import { apiFetch, setToken } from './client'

interface LoginResponse {
  token: string
  user: { username: string }
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  setToken(res.token)
  return res
}

export async function getMe(): Promise<{ user: { username: string } }> {
  return apiFetch('/auth/me')
}
