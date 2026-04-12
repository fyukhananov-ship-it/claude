import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { ARTICLES } from '@/client/data/articles'
import { useReadArticles } from '@/client/lib/hooks'
import TabBar from '@/client/components/TabBar'

interface ApiArticle {
  id: string; title: string; subtitle: string; content: string
  image_url: string | null; read_time: number
}

export default function Journal() {
  const { phoneHash } = useParams<{ phoneHash: string }>()
  const navigate = useNavigate()
  const { isRead } = useReadArticles()
  const [articles, setArticles] = useState<ApiArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiArticle[]>('/client/articles')
      .then(d => { if (Array.isArray(d)) setArticles(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Merge with static articles as fallback
  const allArticles = articles.length > 0
    ? articles.map(a => ({
        id: a.id, slug: a.id, title: a.title, subtitle: a.subtitle,
        readTime: a.read_time, image_url: a.image_url, content: a.content,
      }))
    : ARTICLES.map(a => ({
        id: a.id, slug: a.slug, title: a.title, subtitle: a.subtitle,
        readTime: a.readTime, image_url: null as string | null, content: a.content.join('\n\n'),
      }))

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Header */}
      <div className="bg-white px-5 pt-[max(52px,env(safe-area-inset-top,52px))] pb-4 border-b border-[#F0F0F0]">
        <h1 className="text-[24px] font-extrabold text-[#1C1917] tracking-[-0.03em]">Журнал</h1>
        <p className="text-[13px] text-[#9CA3AF] mt-0.5">Гид по умным покупкам</p>
      </div>

      <div className="px-5 py-5 pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured article — first one large */}
            {allArticles.length > 0 && (
              <button
                onClick={() => navigate(`/client/${phoneHash}/article/${allArticles[0].slug}`)}
                className="w-full rounded-[20px] overflow-hidden press-scale text-left bg-white shadow-card"
              >
                <div className="h-[180px] relative bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]">
                  {allArticles[0].image_url ? (
                    <img src={allArticles[0].image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[64px] opacity-30">📖</span>
                    </div>
                  )}
                  {isRead(allArticles[0].slug) && (
                    <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2.5 py-1 flex items-center gap-1">
                      <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[10px] text-emerald-600 font-semibold">Прочитано</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded-md">Рекомендуем</span>
                    <span className="text-[10px] text-[#9CA3AF]">{allArticles[0].readTime} мин</span>
                  </div>
                  <p className="text-[17px] font-bold text-[#1C1917] leading-tight tracking-[-0.02em]">{allArticles[0].title}</p>
                  <p className="text-[13px] text-[#6B7280] mt-1">{allArticles[0].subtitle}</p>
                </div>
              </button>
            )}

            {/* Rest of articles */}
            {allArticles.slice(1).map(article => (
              <button
                key={article.id}
                onClick={() => navigate(`/client/${phoneHash}/article/${article.slug}`)}
                className="w-full bg-white rounded-[16px] p-3.5 flex gap-3.5 press-scale text-left shadow-card"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#F5F6F8]">
                  {article.image_url ? (
                    <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F0F0F0] to-[#E5E7EB]">
                      <span className="text-[24px] opacity-40">📝</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-[#9CA3AF] font-medium">{article.readTime} мин</span>
                    {isRead(article.slug) && (
                      <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[14px] font-bold text-[#1C1917] leading-tight line-clamp-2">{article.title}</p>
                  <p className="text-[12px] text-[#9CA3AF] mt-1 truncate">{article.subtitle}</p>
                </div>
              </button>
            ))}

            {allArticles.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[14px] text-[#9CA3AF]">Скоро здесь появятся статьи</p>
              </div>
            )}
          </div>
        )}
      </div>

      <TabBar active="journal" />
    </div>
  )
}
