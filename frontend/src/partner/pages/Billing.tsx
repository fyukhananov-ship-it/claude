import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatCurrency } from '@/lib/utils'

interface Balance {
  partner_id: string
  balance: string
}

interface BillingTx {
  id: number
  type: string
  amount: string
  balance_after: string
  reference_id: string | null
  created_at: string
}

const typeMap: Record<string, { label: string; variant: 'success' | 'error' | 'warning' | 'info' }> = {
  topup: { label: 'Пополнение', variant: 'success' },
  cashback: { label: 'Кэшбэк', variant: 'error' },
  commission: { label: 'Комиссия', variant: 'warning' },
  cpm: { label: 'CPM', variant: 'info' },
}

export default function Billing() {
  const [balance, setBalance] = useState<string>('0')
  const [transactions, setTransactions] = useState<BillingTx[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Balance>('/billing/balance'),
      api.get<BillingTx[]>('/billing/transactions'),
    ])
      .then(([b, txs]) => {
        setBalance(b.balance)
        setTransactions(txs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-beeline-black mb-6">Биллинг</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-beeline-gray">Текущий баланс</p>
            <p className="text-4xl font-bold text-beeline-black mt-2">
              {formatCurrency(balance)}
            </p>
            <div className="bg-blue-50 rounded-xl p-3 mt-4">
              <p className="text-xs text-blue-600">
                Пополнение баланса через оператора. Обратитесь к вашему менеджеру.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Автосписание</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-beeline-gray">Кэшбэк клиентам</span>
                <span>Автоматически при matching</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-beeline-gray">Комиссия платформы</span>
                <span>3.6% от GMV</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-beeline-gray">CPM за плейсменты</span>
                <span>По настроенным ставкам</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>История операций</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-beeline-gray">Загрузка...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-beeline-gray">Нет операций</div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Дата</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead className="text-right">Баланс</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const t = typeMap[tx.type] || typeMap.commission
                  const amount = parseFloat(tx.amount)
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-beeline-gray">
                        {new Date(tx.created_at).toLocaleString('ru')}
                      </TableCell>
                      <TableCell><Badge variant={t.variant}>{t.label}</Badge></TableCell>
                      <TableCell className={`text-right font-medium ${amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(tx.balance_after)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
