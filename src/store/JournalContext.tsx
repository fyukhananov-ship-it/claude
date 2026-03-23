import { createContext, useContext, useState, type ReactNode } from 'react'
import type { JournalArticle } from '../data/journal'
import { articles as defaultArticles } from '../data/journal'
import * as store from '../data/journalStore'

interface JournalContextType {
  articles: JournalArticle[]
  addArticle: (article: JournalArticle) => void
  updateArticle: (id: string, updates: Partial<JournalArticle>) => void
  deleteArticle: (id: string) => void
}

const JournalContext = createContext<JournalContextType | null>(null)

export function JournalProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<JournalArticle[]>(() =>
    store.getArticles(defaultArticles)
  )

  const value: JournalContextType = {
    articles,
    addArticle: (article) => setArticles(store.addArticle(article)),
    updateArticle: (id, updates) => setArticles(store.updateArticle(id, updates)),
    deleteArticle: (id) => setArticles(store.deleteArticle(id)),
  }

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  )
}

export function useJournal(): JournalContextType {
  const ctx = useContext(JournalContext)
  if (!ctx) throw new Error('useJournal must be used within JournalProvider')
  return ctx
}
