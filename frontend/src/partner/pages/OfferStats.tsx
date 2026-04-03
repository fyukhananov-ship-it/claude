import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface Stats {
  offer_id: string
  impressions: number
  clicks: number
  ctr: number
  activations: number
  purchases: number
  gmv: string
  cashback_total: string
  budget_remaining: string
}

export default function OfferStats() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get<Stats>(`/offers/${id}/stats`)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-12 text-beeline-gray">Загрузка...</div>
  if (!stats) return <div className="text-center py-12 text-beeline-gray">Статистика недоступна</div>

  const handleExportCSV = () => {
    const csv = [
      'Метрика,Значение',
      `Показы,${stats.impressions}`,
      `Клики,${stats.clicks}`,
      `CTR,${stats.ctr}%`,
      `Активации,${stats.activations}`,
      `Покупки,${stats.purchases}`,
      `GMV,${stats.gmv}`,
      `Кэшбэк,${stats.cashback_total}`,
      `Остаток бюджета,${stats.budget_remaining}`,
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `offer-${id}-stats.csv`
    link.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-beeline-black">Аналитика оффера</h1>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          Выгрузить CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Показы" value={stats.impressions.toLocaleString('ru')} />
        <StatCard title="Клики" value={stats.clicks.toLocaleString('ru')} />
        <StatCard title="CTR" value={`${stats.ctr}%`} />
        <StatCard title="Активации" value={stats.activations.toLocaleString('ru')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Покупки" value={stats.purchases.toLocaleString('ru')} />
        <StatCard title="GMV" value={formatCurrency(stats.gmv)} />
        <StatCard title="Кэшбэк начислен" value={formatCurrency(stats.cashback_total)} />
        <StatCard title="Остаток бюджета" value={formatCurrency(stats.budget_remaining)} />
      </div>

      <Card>
        <CardHeader><CardTitle>Динамика по дням</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-beeline-gray text-sm">
            График будет подключен к API daily stats
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
