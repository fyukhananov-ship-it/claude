import { useState, useEffect, useCallback } from 'react'

// ─── Favorites ───
const FAV_KEY = 'clo_favorites'

function readFavs(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>(readFavs)

  useEffect(() => {
    const sync = () => setFavs(readFavs())
    window.addEventListener('storage', sync)
    window.addEventListener('favorites-changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('favorites-changed', sync)
    }
  }, [])

  const toggle = useCallback((id: string) => {
    const cur = readFavs()
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]
    localStorage.setItem(FAV_KEY, JSON.stringify(next))
    setFavs(next)
    window.dispatchEvent(new Event('favorites-changed'))
  }, [])

  const has = useCallback((id: string) => favs.includes(id), [favs])

  return { favs, toggle, has }
}

// ─── Online status ───
export function useOnline() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

// ─── Read articles ───
const READ_KEY = 'clo_read_articles'

export function useReadArticles() {
  const [read, setRead] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]') } catch { return [] }
  })

  const markRead = useCallback((slug: string) => {
    setRead(prev => {
      if (prev.includes(slug)) return prev
      const next = [...prev, slug]
      localStorage.setItem(READ_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isRead = useCallback((slug: string) => read.includes(slug), [read])

  return { markRead, isRead }
}
