import type { JournalArticle } from './journal'

const STORAGE_KEY = 'lv-journal'

function readFromStorage(): JournalArticle[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as JournalArticle[]
  } catch {
    return null
  }
}

function writeToStorage(data: JournalArticle[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getArticles(defaultArticles: JournalArticle[]): JournalArticle[] {
  const stored = readFromStorage()
  if (stored) return stored
  writeToStorage(defaultArticles)
  return [...defaultArticles]
}

export function saveArticles(articles: JournalArticle[]): JournalArticle[] {
  writeToStorage(articles)
  return articles
}

export function addArticle(article: JournalArticle): JournalArticle[] {
  const data = readFromStorage() || []
  data.unshift(article)
  return saveArticles(data)
}

export function updateArticle(id: string, updates: Partial<JournalArticle>): JournalArticle[] {
  const data = readFromStorage() || []
  const idx = data.findIndex((a) => a.id === id)
  if (idx !== -1) {
    data[idx] = { ...data[idx], ...updates, id }
  }
  return saveArticles(data)
}

export function deleteArticle(id: string): JournalArticle[] {
  const data = (readFromStorage() || []).filter((a) => a.id !== id)
  return saveArticles(data)
}
