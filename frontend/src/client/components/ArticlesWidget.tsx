import { useNavigate } from 'react-router-dom'
import { ARTICLES } from '@/client/data/articles'
import { cn } from '@/lib/utils'

export default function ArticlesWidget({ phoneHash }: { phoneHash: string }) {
  const navigate = useNavigate()

  return (
    <div className="mb-6 pt-2 pb-1 bg-[#f2f2f5] border-y border-[#e8e8ec]">
      <div className="px-5 flex items-baseline justify-between mb-3 pt-4">
        <h2 className="text-[18px] font-extrabold text-[#111] tracking-[-0.02em]">Полезное</h2>
        <span className="text-[11px] text-[#bbb] font-bold uppercase tracking-[0.08em]">Статьи</span>
      </div>
      <div className="pl-5 overflow-x-auto no-scrollbar pb-4">
        <div className="flex gap-3 pr-5">
          {ARTICLES.map(article => (
            <button
              key={article.id}
              onClick={() => navigate(`/client/${phoneHash}/article/${article.slug}`)}
              className="flex-shrink-0 w-[200px] rounded-2xl overflow-hidden press-scale text-left shadow-sm"
            >
              <div className={cn('h-[120px] p-4 flex flex-col justify-between bg-gradient-to-br relative', article.gradient)}>
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute bottom-0 left-0 w-14 h-14 rounded-full bg-black/5" />
                <div className="relative z-10">
                  <span className="text-[24px]">{article.icon}</span>
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <svg className="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[10px] text-white/80 font-bold">{article.readTime} мин</span>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[#f0f0f0] border-t-0 rounded-b-2xl p-3">
                <p className="text-[13px] font-bold text-[#111] leading-tight line-clamp-2">{article.title}</p>
                <p className="text-[11px] text-[#999] mt-1 truncate">{article.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
