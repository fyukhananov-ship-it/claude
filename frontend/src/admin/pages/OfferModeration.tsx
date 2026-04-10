import { useState, useEffect, useCallback } from 'react'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import { CATEGORIES } from '@/api/mockData'
import { api } from '@/api/client'

interface Offer {
  id: string; partner_id: string; partner_name: string; name: string; description: string
  cashback_type: string; cashback_rate: string; min_check: string; max_cashback_per_tx: string
  max_cashback_per_client: string; budget: string; budget_spent: string
  start_date: string; end_date: string; status: string; segment: string; category: string; terminals_count: number
  image_url?: string | null
}

interface Partner { id: string; name: string }

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

const today = new Date().toISOString().split('T')[0]
const in90 = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]

const emptyForm = {
  partner_id: '', name: '', description: '', cashback_type: 'percent', cashback_rate: '',
  min_check: '', max_cashback_per_tx: '', max_cashback_per_client: '', budget: '',
  start_date: today, end_date: in90, segment: 'all', category: '', image_url: '',
}

export default function OfferModeration() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get<Offer[]>('/admin/offers'),
      api.get<Partner[]>('/admin/partners'),
    ]).then(([o, p]) => {
      setOffers(Array.isArray(o) ? o : [])
      setPartners(Array.isArray(p) ? p : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const moderate = async (id: string, action: 'approve' | 'reject') => {
    setActing(id)
    try { await api.put(`/admin/offers/${id}/moderate`, { action }); load() }
    catch {} finally { setActing(null) }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowCreate(true)
  }

  const openEdit = (o: Offer) => {
    setEditingId(o.id)
    // Convert stored values back to form-friendly format
    const rateDisplay = o.cashback_type === 'percent'
      ? (parseFloat(o.cashback_rate) * 100).toFixed(0)
      : parseFloat(o.cashback_rate).toFixed(0)
    setForm({
      partner_id: o.partner_id,
      name: o.name,
      description: o.description,
      cashback_type: o.cashback_type,
      cashback_rate: rateDisplay,
      min_check: parseFloat(o.min_check).toFixed(0),
      max_cashback_per_tx: parseFloat(o.max_cashback_per_tx).toFixed(0),
      max_cashback_per_client: parseFloat(o.max_cashback_per_client).toFixed(0),
      budget: parseFloat(o.budget).toFixed(0),
      start_date: o.start_date,
      end_date: o.end_date,
      segment: o.segment,
      category: o.category || '',
      image_url: o.image_url || '',
    })
    setShowCreate(true)
  }

  const closeModal = () => {
    setShowCreate(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const rate = form.cashback_type === 'percent'
        ? (parseFloat(form.cashback_rate) / 100).toFixed(4)
        : parseFloat(form.cashback_rate).toFixed(4)
      const payload = {
        ...form, cashback_rate: rate,
        min_check: parseFloat(form.min_check || '0').toFixed(2),
        max_cashback_per_tx: parseFloat(form.max_cashback_per_tx || '0').toFixed(2),
        max_cashback_per_client: parseFloat(form.max_cashback_per_client || '0').toFixed(2),
        budget: parseFloat(form.budget || '0').toFixed(2),
      }
      if (editingId) {
        await api.put(`/admin/offers/${editingId}`, payload)
      } else {
        await api.post('/admin/offers', payload)
      }
      closeModal()
      load()
    } catch {} finally { setSaving(false) }
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
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Офферы</h1>
          <p className="text-[13px] text-[#999] mt-1 font-medium">{offers.length} всего, {counts.active || 0} активных</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
          Создать оффер
        </button>
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
              {['Партнёр', 'Оффер', 'Категория', 'Кэшбэк', 'Мин.чек', 'Бюджет', 'Статус', 'Действия'].map(h => (
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
                      {o.image_url ? (
                        <img src={o.image_url} alt={o.partner_name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">{o.partner_name[0]}</div>
                      )}
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
                    <div className="flex items-center gap-1.5">
                      {o.status === 'moderation' && (
                        <>
                          <button onClick={() => moderate(o.id, 'approve')} disabled={acting === o.id}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold press-scale disabled:opacity-50">Одобрить</button>
                          <button onClick={() => moderate(o.id, 'reject')} disabled={acting === o.id}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-bold press-scale disabled:opacity-50">Отклонить</button>
                        </>
                      )}
                      {o.status === 'draft' && (
                        <button onClick={() => moderate(o.id, 'approve')} className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 press-scale px-2">Активировать</button>
                      )}
                      <button onClick={() => openEdit(o)} className="w-8 h-8 rounded-lg bg-[#f5f5f7] hover:bg-[#FFD500]/20 flex items-center justify-center press-scale" title="Редактировать">
                        <svg className="w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ===== Create / Edit Offer Modal ===== */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 backdrop-blur-sm overflow-y-auto" onClick={closeModal}>
          <div className="bg-white rounded-2xl border border-[#f0f0f0] w-full max-w-2xl p-6 shadow-2xl mb-16" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[20px] font-extrabold text-[#111]">{editingId ? 'Редактировать оффер' : 'Создать оффер'}</h2>
                {editingId && <p className="text-[11px] text-[#999] font-medium mt-0.5">ID: {editingId}</p>}
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e5e5e5]">
                <svg className="w-4 h-4 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-5">
              {/* Partner + Category */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Партнёр">
                  <select value={form.partner_id} onChange={e => upd('partner_id', e.target.value)} className="inp">
                    <option value="">Выберите партнёра</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
                <Field label="Категория">
                  <select value={form.category} onChange={e => upd('category', e.target.value)} className="inp">
                    <option value="">Выберите категорию</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              {/* Name + Description */}
              <Field label="Название оффера">
                <input value={form.name} onChange={e => upd('name', e.target.value)} className="inp" placeholder="Кэшбэк 10% в Пятёрочке" />
              </Field>
              <Field label="Описание">
                <textarea value={form.description} onChange={e => upd('description', e.target.value)} rows={3} className="inp resize-none" placeholder="Условия и детали оффера..." />
              </Field>
              <Field label="Изображение (URL или загрузка)">
                <div className="flex gap-3">
                  <input value={form.image_url} onChange={e => upd('image_url', e.target.value)} className="inp flex-1" placeholder="https://... или перетащите файл" />
                  <label className="px-4 py-2.5 rounded-xl bg-[#f0f0f0] text-[#666] text-[12px] font-bold cursor-pointer press-scale hover:bg-[#e5e5e5] flex items-center gap-1.5 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Загрузить
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = () => upd('image_url', reader.result as string)
                        reader.readAsDataURL(file)
                      }
                    }} />
                  </label>
                </div>
                {form.image_url && (
                  <div className="mt-2 relative inline-block">
                    <img src={form.image_url} alt="" className="h-20 rounded-xl object-cover" />
                    <button onClick={() => upd('image_url', '')} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">×</button>
                  </div>
                )}
              </Field>

              {/* Cashback */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Тип кэшбэка">
                  <select value={form.cashback_type} onChange={e => upd('cashback_type', e.target.value)} className="inp">
                    <option value="percent">Процент</option>
                    <option value="fixed">Фикс. сумма</option>
                  </select>
                </Field>
                <Field label={form.cashback_type === 'percent' ? 'Ставка (%)' : 'Сумма (руб.)'}>
                  <input type="number" value={form.cashback_rate} onChange={e => upd('cashback_rate', e.target.value)} className="inp font-mono-cash" placeholder={form.cashback_type === 'percent' ? '10' : '300'} />
                </Field>
                <Field label="Мин. чек (руб.)">
                  <input type="number" value={form.min_check} onChange={e => upd('min_check', e.target.value)} className="inp font-mono-cash" placeholder="500" />
                </Field>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Макс./транзакция">
                  <input type="number" value={form.max_cashback_per_tx} onChange={e => upd('max_cashback_per_tx', e.target.value)} className="inp font-mono-cash" placeholder="1000" />
                </Field>
                <Field label="Макс./клиент">
                  <input type="number" value={form.max_cashback_per_client} onChange={e => upd('max_cashback_per_client', e.target.value)} className="inp font-mono-cash" placeholder="5000" />
                </Field>
                <Field label="Бюджет (руб.)">
                  <input type="number" value={form.budget} onChange={e => upd('budget', e.target.value)} className="inp font-mono-cash" placeholder="500000" />
                </Field>
              </div>

              {/* Dates + Segment */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Дата начала">
                  <input type="date" value={form.start_date} onChange={e => upd('start_date', e.target.value)} className="inp" />
                </Field>
                <Field label="Дата окончания">
                  <input type="date" value={form.end_date} onChange={e => upd('end_date', e.target.value)} className="inp" />
                </Field>
                <Field label="Сегмент">
                  <select value={form.segment} onChange={e => upd('segment', e.target.value)} className="inp">
                    <option value="all">Все клиенты</option>
                    <option value="new">Новые</option>
                    <option value="existing">Существующие</option>
                  </select>
                </Field>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-[#f5f5f5]">
                <button onClick={closeModal} className="flex-1 py-3 rounded-xl bg-[#f0f0f0] text-[#666] text-[13px] font-bold press-scale">
                  Отмена
                </button>
                <button onClick={handleSave}
                  disabled={saving || !form.partner_id || !form.name || !form.cashback_rate || !form.budget}
                  className="flex-1 py-3 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale disabled:opacity-40 shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
                  {saving
                    ? (editingId ? 'Сохранение...' : 'Создание...')
                    : (editingId ? 'Сохранить изменения' : 'Создать и опубликовать')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.inp { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #eee; font-size: 13px; font-weight: 500; outline: none; transition: all 0.15s; } .inp:focus { border-color: #FFD500; box-shadow: 0 0 0 3px rgba(255,213,0,0.15); }`}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
