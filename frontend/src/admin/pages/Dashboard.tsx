import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from '@/api/client'

interface DashboardData {
  active_offers: number
  transactions_today: number
  transactions_week: number
  cashback_today: number
  cashback_week: number
  partners_count: number
  low_balance_count: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<DashboardData>('/admin/dashboard')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-beeline-gray">Загрузка...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Ошибка: {error}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-beeline-black mb-6">Дашборд</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Активных офферов"
          value={data?.active_offers ?? 0}
        />
        <StatCard
          title="Транзакций сегодня"
          value={data?.transactions_today ?? 0}
        />
        <StatCard
          title="Транзакций за неделю"
          value={data?.transactions_week ?? 0}
        />
        <StatCard
          title="Кэшбэк сегодня"
          value={formatCurrency(data?.cashback_today ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Кэшбэк за неделю"
          value={formatCurrency(data?.cashback_week ?? 0)}
        />
        <StatCard
          title="Партнёров"
          value={data?.partners_count ?? 0}
        />
        <StatCard
          title="С низким балансом"
          value={data?.low_balance_count ?? 0}
          className={
            (data?.low_balance_count ?? 0) > 0
              ? 'border-red-200 bg-red-50'
              : undefined
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/registry">
              <Button>Загрузить реестр</Button>
            </Link>
            <Link to="/admin/moderation">
              <Button variant="secondary">Модерация офферов</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
