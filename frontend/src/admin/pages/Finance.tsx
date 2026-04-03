import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/api/client'

interface RevShare { total_gmv: string; total_commission: string; revshare_traffic_holder: string; revshare_nspk: string; revshare_beeline: string; net_platform: string }
interface Pnl { partner_id: string; partner_name: string; gmv: string; commission: string; cashback: string; net: string }

export default function Finance() {
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const [start, setStart] = useState(fmt(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [end, setEnd] = useState(fmt(today))
  const [rev, setRev] = useState<RevShare | null>(null)
  const [pnl, setPnl] = useState<Pnl[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const [r, p] = await Promise.all([
        api.get<RevShare>('/admin/finance/revshare', { period_start: start, period_end: end }),
        api.get<Pnl[]>('/admin/finance/pnl', { period_start: start, period_end: end }),
      ])
      setRev(r); setPnl(Array.isArray(p) ? p : [])
    } catch {} finally { setLoading(false) }
  }

  const exportCsv = () => {
    if (!pnl.length) return
    const csv = '\uFEFF' + ['Партнёр,GMV,Комиссия,Кэшбэк,NET', ...pnl.map(r => `${r.partner_name},${r.gmv},${r.commission},${r.cashback},${r.net}`)].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `pnl_${start}_${end}.csv`; a.click()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Финансы</h1>
        <p className="text-[13px] text-[#999] mt-1 font-medium">Rev share и P&L по партнёрам</p>
      </div>

      {/* Period */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Начало</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[#eee] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Конец</label>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[#eee] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" />
        </div>
        <button onClick={fetch} disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale disabled:opacity-50 shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
          {loading ? 'Загрузка...' : 'Сформировать'}
        </button>
      </div>

      {/* Rev share */}
      {rev && (
        <div className="mb-6">
          <h2 className="text-[18px] font-extrabold text-[#111] mb-4">Rev Share</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'GMV', value: formatCurrency(rev.total_gmv) },
              { label: 'Комиссия (3.6%)', value: formatCurrency(rev.total_commission) },
              { label: 'NET платформы', value: formatCurrency(rev.net_platform), accent: true },
            ].map(m => (
              <div key={m.label} className={`bg-white rounded-2xl border ${m.accent ? 'border-[#FFD500]/30' : 'border-[#f0f0f0]'} p-5`}>
                <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.1em]">{m.label}</p>
                <p className="font-mono-cash text-[24px] font-extrabold text-[#111] mt-2">{m.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Билайн (площадка) 20%', value: formatCurrency(rev.revshare_traffic_holder) },
              { label: 'НСПК 17%', value: formatCurrency(rev.revshare_nspk) },
              { label: 'Билайн (инвестиции) 10%', value: formatCurrency(rev.revshare_beeline) },
            ].map(m => (
              <div key={m.label} className="bg-[#fafafa] rounded-xl p-4">
                <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.08em]">{m.label}</p>
                <p className="font-mono-cash text-[18px] font-extrabold text-[#111] mt-1">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* P&L */}
      {pnl.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-[#111]">P&L по партнёрам</h2>
            <button onClick={exportCsv} className="px-3 py-1.5 rounded-lg bg-[#f0f0f0] text-[#666] text-[11px] font-bold press-scale hover:bg-[#e5e5e5]">
              Выгрузить CSV
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f5f5f5]">
                {['Партнёр', 'GMV', 'Комиссия', 'Кэшбэк', 'NET'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[#999] uppercase tracking-[0.08em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pnl.map(r => (
                <tr key={r.partner_id} className="border-b border-[#fafafa] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-5 py-3.5 text-[13px] font-bold text-[#111]">{r.partner_name}</td>
                  <td className="px-5 py-3.5 font-mono-cash text-[13px] font-bold">{formatCurrency(r.gmv)}</td>
                  <td className="px-5 py-3.5 font-mono-cash text-[13px]">{formatCurrency(r.commission)}</td>
                  <td className="px-5 py-3.5 font-mono-cash text-[13px] text-red-500">{formatCurrency(r.cashback)}</td>
                  <td className="px-5 py-3.5 font-mono-cash text-[13px] font-bold text-emerald-600">{formatCurrency(r.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!rev && !loading && (
        <div className="flex items-center justify-center h-40">
          <p className="text-[13px] text-[#999]">Выберите период и нажмите &laquo;Сформировать&raquo;</p>
        </div>
      )}
    </div>
  )
}
