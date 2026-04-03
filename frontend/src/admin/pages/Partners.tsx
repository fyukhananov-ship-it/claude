import { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { api } from '@/api/client'

interface Partner {
  id: string; name: string; contact_email: string; contact_phone: string
  balance: string; status: string; offers_count: number; created_at: string
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create' | 'topup' | null>(null)
  const [topupId, setTopupId] = useState('')
  const [form, setForm] = useState({ name: '', contact_email: '', contact_phone: '' })
  const [topupAmount, setTopupAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get<Partner[]>('/admin/partners')
      .then(d => setPartners(Array.isArray(d) ? d : []))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    setSaving(true)
    try { await api.post('/admin/partners', form); setModal(null); setForm({ name: '', contact_email: '', contact_phone: '' }); load() }
    catch {} finally { setSaving(false) }
  }

  const handleTopup = async () => {
    if (!topupId || !topupAmount) return
    setSaving(true)
    try { await api.put(`/admin/partners/${topupId}/balance`, { amount: parseFloat(topupAmount) }); setModal(null); setTopupAmount(''); load() }
    catch {} finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Партнёры</h1>
          <p className="text-[13px] text-[#999] mt-1 font-medium">{partners.length} зарегистрировано</p>
        </div>
        <button onClick={() => setModal('create')} className="px-4 py-2.5 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
          Добавить партнёра
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f5f5f5]">
              {['Партнёр', 'Email', 'Баланс', 'Статус', 'Офферов', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-[#999] uppercase tracking-[0.08em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id} className="border-b border-[#fafafa] last:border-0 hover:bg-[#fafafa] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-[13px] font-extrabold">{p.name[0]}</div>
                    <span className="text-[14px] font-bold text-[#111]">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-[13px] text-[#666]">{p.contact_email}</td>
                <td className="px-5 py-4 font-mono-cash text-[14px] font-bold text-[#111]">{formatCurrency(p.balance)}</td>
                <td className="px-5 py-4">
                  <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full', p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
                    {p.status === 'active' ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono-cash text-[14px] font-bold text-[#111]">{p.offers_count}</td>
                <td className="px-5 py-4">
                  <button onClick={() => { setTopupId(p.id); setModal('topup') }} className="text-[12px] font-bold text-[#FFD500] hover:text-[#B8960A] transition-colors">
                    Пополнить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl border border-[#f0f0f0] w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-[18px] font-extrabold text-[#111] mb-5">
              {modal === 'create' ? 'Новый партнёр' : 'Пополнить баланс'}
            </h2>
            {modal === 'create' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Название</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="ООО Магазин" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Email</label>
                  <input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="partner@example.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Телефон</label>
                  <input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="+7 (999) 123-45-67" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl bg-[#f0f0f0] text-[#666] text-[13px] font-bold press-scale">Отмена</button>
                  <button onClick={handleCreate} disabled={saving || !form.name || !form.contact_email} className="flex-1 py-3 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale disabled:opacity-50 shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
                    {saving ? 'Создание...' : 'Создать'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Сумма (&#8381;)</label>
                  <input type="number" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] font-mono-cash focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="100000" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl bg-[#f0f0f0] text-[#666] text-[13px] font-bold press-scale">Отмена</button>
                  <button onClick={handleTopup} disabled={saving || !topupAmount} className="flex-1 py-3 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale disabled:opacity-50">
                    {saving ? 'Пополнение...' : 'Пополнить'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
