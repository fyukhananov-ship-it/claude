import { mockApiCall } from './mockData'

const API_BASE = '/api/v1'

// Use mocks when no backend available (GitHub Pages)
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || !import.meta.env.DEV && typeof window !== 'undefined'

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('access_token')
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options

    // Mock mode — return demo data
    if (USE_MOCKS) {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300)) // simulate latency
      const body = init.body ? JSON.parse(init.body as string) : undefined
      return mockApiCall(init.method || 'GET', path, body) as T
    }

    let url = `${API_BASE}${path}`

    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string>),
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (init.body && typeof init.body === 'string') {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, { ...init, headers })

    if (response.status === 401) {
      // Try refresh token
      const refreshed = await this.refreshToken()
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getToken()}`
        const retryResponse = await fetch(url, { ...init, headers })
        if (!retryResponse.ok) throw new Error(await retryResponse.text())
        return retryResponse.json()
      }
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = import.meta.env.BASE_URL + 'login'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(errorBody || response.statusText)
    }

    return response.json()
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return false

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) return false

      const data = await response.json()
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      return true
    } catch {
      return false
    }
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params })
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async uploadFile<T>(path: string, file: File, fieldName = 'file'): Promise<T> {
    if (USE_MOCKS) {
      await new Promise(r => setTimeout(r, 500))
      return mockApiCall('POST', path, { filename: file.name }) as T
    }

    const formData = new FormData()
    formData.append(fieldName, file)

    return this.request<T>(path, {
      method: 'POST',
      body: formData as unknown as string,
    })
  }

  async login(email: string, password: string) {
    const data = await this.post<{
      access_token: string
      refresh_token: string
    }>('/auth/login', { email, password })

    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data
  }

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

export const api = new ApiClient()
