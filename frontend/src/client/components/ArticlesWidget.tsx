import { useNavigate } from 'react-router-dom'
import { ARTICLES } from '@/client/data/articles'
import { useReadArticles } from '@/client/lib/hooks'
import { cn } from '@/lib/utils'

export default function ArticlesWidget({ phoneHash }: { phoneHash: string }) {
  const navigate = useNavigate()
  const { isRead } = useReadArticles()

  return (
    <div className="mb-6">
      <div className="px-5 flex items-baseline justify-between mb-3">
        <h2 className="text-[18px] font-extrabold text-[#0A0A0C] tracking-[-0.02em]">Полезное</h2>
        <span className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-[0.1em]">Гайды</span>
      </div>
      <div className="pl-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 pr-5">
          {ARTICLES.map(article => {
            const read = isRead(article.slug)
            return (
              <button
                key={article.id}
                onClick={() => navigate(`/client/${phoneHash}/article/${article.slug}`)}
                className="flex-shrink-0 w-[220px] rounded-[20px] overflow-hidden press-scale text-left shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className={cn('h-[128px] p-4 flex flex-col justify-between bg-gradient-to-br relative', article.gradient)}>
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                  <div className="absolute bottom-0 left-0 w-14 h-14 rounded-full bg-black/5" />
                  <div className="relative z-10 flex items-start justify-between">
                    <span className="text-[28px]">{article.icon}</span>
                    {read && (
                      <div className="bg-white/25 backdrop-blur-md rounded-full w-6 h-6 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-md rounded-full px-2 py-0.5">
                      <svg className="w-3 h-3 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[11px] text-white font-bold">{article.readTime} мин</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3.5">
                  <p className="text-[13px] font-bold text-[#0A0A0C] leading-tight line-clamp-2 tracking-[-0.01em]">{article.title}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1 truncate font-medium">{article.subtitle}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
