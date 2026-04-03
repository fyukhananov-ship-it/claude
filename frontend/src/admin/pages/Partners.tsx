import { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { api } from '@/api/client'

interface Partner {
  id: string
  name: string
  email: string
  balance: number
  status: string
  offers_count: number
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '' })
  const [creating, setCreating] = useState(false)

  const [topUpPartnerId, setTopUpPartnerId] = useState<string | null>(null)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topping, setTopping] = useState(false)

  const fetchPartners = useCallback(() => {
    setLoading(true)
    api
      .get<Partner[]>('/admin/partners')
      .then(setPartners)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const handleCreate = async () => {
    setCreating(true)
    try {
      await api.post('/admin/partners', createForm)
      setShowCreateModal(false)
      setCreateForm({ name: '', email: '', phone: '' })
      fetchPartners()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка создания'
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  const handleTopUp = async () => {
    if (!topUpPartnerId || !topUpAmount) return
    setTopping(true)
    try {
      await api.put(`/admin/partners/${topUpPartnerId}/balance`, {
        amount: parseFloat(topUpAmount),
      })
      setTopUpPartnerId(null)
      setTopUpAmount('')
      fetchPartners()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка пополнения'
      setError(message)
    } finally {
      setTopping(false)
    }
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'blocked':
        return 'error'
      default:
        return 'default'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен'
      case 'blocked':
        return 'Заблокирован'
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
        <h1 className="text-2xl font-bold text-beeline-black">Партнёры</h1>
        <Button onClick={() => setShowCreateModal(true)}>Добавить партнёра</Button>
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
                <TableHead>Название</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Баланс</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Офферов</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-beeline-gray">
                    Нет партнёров
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell>{formatCurrency(partner.balance)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(partner.status)}>
                        {statusLabel(partner.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{partner.offers_count}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTopUpPartnerId(partner.id)}
                      >
                        Пополнить баланс
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Partner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Добавить партнёра</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Название компании"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="ООО Магазин"
              />
              <Input
                label="Email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="partner@example.com"
              />
              <Input
                label="Телефон"
                type="tel"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateForm({ name: '', email: '', phone: '' })
                  }}
                >
                  Отмена
                </Button>
                <Button onClick={handleCreate} disabled={creating || !createForm.name || !createForm.email}>
                  {creating ? 'Создание...' : 'Создать'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Up Balance Modal */}
      {topUpPartnerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Пополнить баланс</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Сумма (руб.)"
                type="number"
                min="0"
                step="0.01"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="10000"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTopUpPartnerId(null)
                    setTopUpAmount('')
                  }}
                >
                  Отмена
                </Button>
                <Button onClick={handleTopUp} disabled={topping || !topUpAmount}>
                  {topping ? 'Пополнение...' : 'Пополнить'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
