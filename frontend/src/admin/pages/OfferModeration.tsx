import { useState, useEffect, useCallback } from 'react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/Table'
import { api } from '@/api/client'

interface Offer {
  id: string
  partner_id: string
  partner_name: string
  name: string
  description: string
  cashback_type: string
  cashback_rate: string
  min_check: string
  max_cashback_per_tx: string
  max_cashback_per_client: string
  budget: string
  budget_spent: string
  start_date: string
  end_date: string
  status: string
  segment: string
  category: string
  terminals_count: number
}

const statusTabs = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'moderation', label: 'На модерации' },
  { value: 'draft', label: 'Черновики' },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' | 'error' }> = {
  active: { label: 'Активен', variant: 'success' },
  moderation: { label: 'На модерации', variant: 'warning' },
  draft: { label: 'Черновик', variant: 'default' },
  paused: { label: 'Приостановлен', variant: 'info' },
  finished: { label: 'Завершён', variant: 'default' },
}

export default function OfferModeration() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchOffers = useCallback(() => {
    setLoading(true)
    api.get<Offer[]>('/admin/offers')
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchOffers() }, [fetchOffers])

  const handleModerate = async (offerId: string, action: 'approve' | 'reject') => {
    setActionLoading(offerId)
    try {
      await api.put(`/admin/offers/${offerId}/moderate`, { action })
      fetchOffers()
    } catch {} finally { setActionLoading(null) }
  }

  const filtered = offers.filter(o => {
    if (tab !== 'all' && o.status !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      return o.partner_name.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || o.category.toLowerCase().includes(q)
    }
    return true
  })

  const tabCounts = {
    all: offers.length,
    active: offers.filter(o => o.status === 'active').length,
    moderation: offers.filter(o => o.status === 'moderation').length,
    draft: offers.filter(o => o.status === 'draft').length,
  }

  const fmtRate = (o: Offer) => o.cashback_type === 'percent' ? formatPercent(o.cashback_rate) : formatCurrency(o.cashback_rate)

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-beeline-gray">Загрузка...</p></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-beeline-black">Офферы</h1>
        <span className="text-sm text-beeline-gray">{offers.length} всего</span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по партнёру, офферу или категории..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-beeline-yellow"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {statusTabs.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              tab === t.value ? 'bg-beeline-yellow text-beeline-black' : 'bg-white text-beeline-gray border border-gray-200')}>
            {t.label} <span className="ml-1 opacity-60">{tabCounts[t.value as keyof typeof tabCounts] ?? ''}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Партнёр</TableHead>
                <TableHead>Оффер</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Кэшбэк</TableHead>
                <TableHead>Мин. чек</TableHead>
                <TableHead>Бюджет</TableHead>
                <TableHead>Потрачено</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-beeline-gray">
                    {search ? 'Ничего не найдено' : 'Нет офферов'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(o => {
                  const sc = statusConfig[o.status] || statusConfig.draft
                  const expanded = expandedId === o.id
                  return (
                    <TableRow key={o.id} className="cursor-pointer" onClick={() => setExpandedId(expanded ? null : o.id)}>
                      <TableCell className="font-medium">{o.partner_name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{o.name}</p>
                          {expanded && <p className="text-xs text-beeline-gray mt-1 max-w-xs">{o.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{o.category}</span></TableCell>
                      <TableCell className="font-mono text-sm font-semibold">{fmtRate(o)}</TableCell>
                      <TableCell>{formatCurrency(o.min_check)}</TableCell>
                      <TableCell>{formatCurrency(o.budget)}</TableCell>
                      <TableCell>{formatCurrency(o.budget_spent)}</TableCell>
                      <TableCell><Badge variant={sc.variant}>{sc.label}</Badge></TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        {o.status === 'moderation' ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleModerate(o.id, 'approve')} disabled={actionLoading === o.id}>
                              Одобрить
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleModerate(o.id, 'reject')} disabled={actionLoading === o.id}>
                              Отклонить
                            </Button>
                          </div>
                        ) : o.status === 'draft' ? (
                          <Button size="sm" variant="outline" onClick={() => handleModerate(o.id, 'approve')}>
                            Активировать
                          </Button>
                        ) : (
                          <span className="text-xs text-beeline-gray">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
