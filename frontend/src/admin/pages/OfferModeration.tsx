import { useState, useEffect, useCallback } from 'react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { api } from '@/api/client'

interface Offer {
  id: string
  partner_name: string
  title: string
  cashback_rate: number
  budget: number
  status: string
}

export default function OfferModeration() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchOffers = useCallback(() => {
    setLoading(true)
    api
      .get<Offer[]>('/admin/offers', { status: 'moderation' })
      .then(setOffers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  const handleModerate = async (offerId: string, action: 'approve' | 'reject') => {
    setActionLoading(offerId)
    try {
      await api.put(`/admin/offers/${offerId}/moderate`, { action })
      setOffers((prev) => prev.filter((o) => o.id !== offerId))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка модерации'
      setError(message)
    } finally {
      setActionLoading(null)
    }
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'moderation':
        return 'warning'
      case 'active':
        return 'success'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'moderation':
        return 'На модерации'
      case 'active':
        return 'Активен'
      case 'rejected':
        return 'Отклонён'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-beeline-gray">Загрузка...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-beeline-black">Модерация офферов</h1>
        <Badge variant="warning" className="text-sm px-3 py-1">
          {offers.length} на модерации
        </Badge>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Партнёр</TableHead>
                <TableHead>Оффер</TableHead>
                <TableHead>Кэшбэк</TableHead>
                <TableHead>Бюджет</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-beeline-gray">
                    Нет офферов на модерации
                  </TableCell>
                </TableRow>
              ) : (
                offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.partner_name}</TableCell>
                    <TableCell>{offer.title}</TableCell>
                    <TableCell>{formatPercent(offer.cashback_rate)}</TableCell>
                    <TableCell>{formatCurrency(offer.budget)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(offer.status)}>
                        {statusLabel(offer.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleModerate(offer.id, 'approve')}
                          disabled={actionLoading === offer.id}
                        >
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleModerate(offer.id, 'reject')}
                          disabled={actionLoading === offer.id}
                        >
                          Отклонить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
