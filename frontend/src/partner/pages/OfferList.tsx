import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Offer {
  id: string
  name: string
  cashback_type: string
  cashback_rate: string
  budget: string
  budget_spent: string
  status: string
  created_at: string
}

const tabs = [
  { label: 'Все', value: 'all' },
  { label: 'Черновики', value: 'draft' },
  { label: 'Активные', value: 'active' },
  { label: 'На модерации', value: 'moderation' },
  { label: 'Завершённые', value: 'finished' },
]

const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'info' | 'warning' | 'error' }> = {
  draft: { label: 'Черновик', variant: 'default' },
  moderation: { label: 'На модерации', variant: 'info' },
  active: { label: 'Активный', variant: 'success' },
  paused: { label: 'Приостановлен', variant: 'warning' },
  finished: { label: 'Завершён', variant: 'default' },
}

export default function OfferList() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Offer[]>('/offers')
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = tab === 'all' ? offers : offers.filter((o) => o.status === tab)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-beeline-black">Офферы</h1>
        <Link to="/partner/offers/new">
          <Button>Создать оффер</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              tab === t.value ? 'bg-beeline-yellow text-beeline-black' : 'bg-white text-beeline-gray border border-gray-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-beeline-gray">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-beeline-gray">Нет офферов</div>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Название</TableHead>
                <TableHead>Кэшбэк</TableHead>
                <TableHead>Бюджет</TableHead>
                <TableHead>Потрачено</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => {
                const st = statusMap[o.status] || statusMap.draft
                const rateText = o.cashback_type === 'percent'
                  ? formatPercent(o.cashback_rate)
                  : formatCurrency(o.cashback_rate)

                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell>{rateText}</TableCell>
                    <TableCell>{formatCurrency(o.budget)}</TableCell>
                    <TableCell>{formatCurrency(o.budget_spent)}</TableCell>
                    <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                    <TableCell>
                      <Link to={`/partner/offers/${o.id}/stats`} className="text-sm text-blue-600 hover:underline">
                        Статистика
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
