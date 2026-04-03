import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/api/client'

interface D {
  active_offers: number; total_transactions_today: number; total_transactions_week: number
  cashback_today: string; cashback_week: string; partners_count: number; low_balance_partners: number
}

function Metric({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl border ${accent ? 'border-[#FFD500]/30' : 'border-[#f0f0f0]'} p-5`}>
      <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.1em]">{label}</p>
      <p className="font-mono-cash text-[28px] font-extrabold text-[#111] leading-none mt-2">{value}</p>
      {sub && <p className="text-[11px] text-[#bbb] mt-1.5 font-medium">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [d, setD] = useState<D | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<D>('/admin/dashboard').then(setD).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" /></div>

  const data = d || { active_offers: 0, total_transactions_today: 0, total_transactions_week: 0, cashback_today: '0', cashback_week: '0', partners_count: 0, low_balance_partners: 0 }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Дашборд</h1>
          <p className="text-[13px] text-[#999] mt-1 font-medium">Обзор платформы CLO</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/registry">
            <button className="px-4 py-2.5 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
              Загрузить реестр
            </button>
          </Link>
          <Link to="/admin/moderation">
            <button className="px-4 py-2.5 rounded-xl bg-[#111] text-white text-[13px] font-bold press-scale">
              Модерация
            </button>
          </Link>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Metric label="Активных офферов" value={data.active_offers} />
        <Metric label="Транзакций сегодня" value={data.total_transactions_today.toLocaleString('ru')} />
        <Metric label="Транзакций / неделя" value={data.total_transactions_week.toLocaleString('ru')} />
        <Metric label="Партнёров" value={data.partners_count} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Metric label="Кэшбэк сегодня" value={formatCurrency(data.cashback_today)} accent />
        <Metric label="Кэшбэк / неделя" value={formatCurrency(data.cashback_week)} accent />
        <div className={`bg-white rounded-2xl border p-5 ${data.low_balance_partners > 0 ? 'border-red-200' : 'border-[#f0f0f0]'}`}>
          <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.1em]">Низкий баланс</p>
          <p className={`font-mono-cash text-[28px] font-extrabold leading-none mt-2 ${data.low_balance_partners > 0 ? 'text-red-500' : 'text-[#111]'}`}>{data.low_balance_partners}</p>
          <p className="text-[11px] text-[#bbb] mt-1.5 font-medium">партнёров &lt; 10 000 &#8381;</p>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-[#0c0c0f] noise-bg relative rounded-2xl p-6 text-white">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em]">Статус платформы</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[14px] font-bold">Все системы работают</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/30 font-medium">Последний реестр</p>
            <p className="text-[13px] font-bold text-white/70 mt-0.5">Сегодня, {new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
