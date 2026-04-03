import { useState, useEffect, useCallback } from 'react'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import { api } from '@/api/client'

interface Offer {
  id: string; partner_id: string; partner_name: string; name: string; description: string
  cashback_type: string; cashback_rate: string; min_check: string; max_cashback_per_tx: string
  max_cashback_per_client: string; budget: string; budget_spent: string
  start_date: string; end_date: string; status: string; segment: string; category: string; terminals_count: number
}

const tabs = [
  { v: 'all', l: 'Все' }, { v: 'active', l: 'Активные' },
  { v: 'moderation', l: 'На модерации' }, { v: 'draft', l: 'Черновики' },
]

const sts: Record<string, { l: string; c: string }> = {
  active: { l: 'Активен', c: 'bg-emerald-50 text-emerald-600' },
  moderation: { l: 'Модерация', c: 'bg-amber-50 text-amber-600' },
  draft: { l: 'Черновик', c: 'bg-gray-100 text-gray-500' },
  paused: { l: 'Пауза', c: 'bg-sky-50 text-sky-600' },
  finished: { l: 'Завершён', c: 'bg-gray-100 text-gray-400' },
}

export default function OfferModeration() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get<Offer[]>('/admin/offers')
      .then(d => setOffers(Array.isArray(d) ? d : []))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const moderate = async (id: string, action: 'approve' | 'reject') => {
    setActing(id)
    try { await api.put(`/admin/offers/${id}/moderate`, { action }); load() }
    catch {} finally { setActing(null) }
  }

  const filtered = offers.filter(o => {
    if (tab !== 'all' && o.status !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      return o.partner_name.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || (o.category || '').toLowerCase().includes(q)
    }
    return true
  })

  const counts: Record<string, number> = { all: offers.length }
  offers.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })

  const fmtRate = (o: Offer) => o.cashback_type === 'percent' ? formatPercent(o.cashback_rate) : formatCurrency(o.cashback_rate)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Офферы</h1>
          <p className="text-[13px] text-[#999] mt-1 font-medium">{offers.length} всего, {counts.active || 0} активных</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по партнёру, офферу, категории..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eee] bg-white text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40 placeholder-[#ccc]" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={cn('px-4 py-2 rounded-xl text-[12px] font-bold transition-all press-scale',
              tab === t.v ? 'bg-[#111] text-white' : 'bg-white text-[#999] border border-[#eee]')}>
            {t.l} <span className="ml-1 opacity-50">{counts[t.v] || 0}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f5f5f5]">
              {['Партнёр', 'Оффер', 'Категория', 'Кэшбэк', 'Мин. чек', 'Бюджет', 'Статус', 'Действия'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#999] uppercase tracking-[0.08em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-[13px] text-[#999]">{search ? 'Ничего не найдено' : 'Нет офферов'}</td></tr>
            ) : filtered.map(o => {
              const s = sts[o.status] || sts.draft
              return (
                <tr key={o.id} className="border-b border-[#fafafa] last:border-0 hover:bg-[#fafafa] transition-colors cursor-pointer" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">{o.partner_name[0]}</div>
                      <span className="text-[12px] font-bold text-[#111]">{o.partner_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-medium text-[#111] truncate max-w-[200px]">{o.name}</p>
                    {expanded === o.id && <p className="text-[11px] text-[#999] mt-1 max-w-[300px]">{o.description}</p>}
                  </td>
                  <td className="px-4 py-3"><span className="text-[10px] bg-[#f5f5f7] text-[#666] px-2 py-0.5 rounded-full font-medium">{o.category}</span></td>
                  <td className="px-4 py-3 font-mono-cash text-[13px] font-bold text-[#111]">{fmtRate(o)}</td>
                  <td className="px-4 py-3 font-mono-cash text-[12px] text-[#666]">{formatCurrency(o.min_check)}</td>
                  <td className="px-4 py-3">
                    <p className="font-mono-cash text-[12px] font-bold text-[#111]">{formatCurrency(o.budget)}</p>
                    <p className="font-mono-cash text-[10px] text-[#bbb]">- {formatCurrency(o.budget_spent)}</p>
                  </td>
                  <td className="px-4 py-3"><span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', s.c)}>{s.l}</span></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    {o.status === 'moderation' ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => moderate(o.id, 'approve')} disabled={acting === o.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold press-scale disabled:opacity-50">OK</button>
                        <button onClick={() => moderate(o.id, 'reject')} disabled={acting === o.id}
                          className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-bold press-scale disabled:opacity-50">X</button>
                      </div>
                    ) : o.status === 'draft' ? (
                      <button onClick={() => moderate(o.id, 'approve')} className="text-[11px] font-bold text-[#FFD500] hover:text-[#B8960A] press-scale">Активировать</button>
                    ) : <span className="text-[11px] text-[#ddd]">&mdash;</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
