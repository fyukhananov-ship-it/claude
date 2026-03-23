const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

interface StrapiResponse<T> {
  data: T
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } }
}

interface StrapiEntry {
  id: number
  documentId: string
  [key: string]: unknown
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.error?.message || `Strapi error: ${res.status}`)
  }
  return res.json()
}

// Upload file (multipart, no Content-Type header — browser sets boundary)
async function apiUpload(path: string, formData: FormData): Promise<StrapiResponse<StrapiEntry>> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.error?.message || `Strapi upload error: ${res.status}`)
  }
  return res.json()
}

export { STRAPI_URL, apiFetch, apiUpload }
export type { StrapiResponse, StrapiEntry }
