import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { api } from '@/api/client'

interface RevShareData {
  gmv: number
  commission: number
  revshare_beeline_platform: number
  revshare_nspk: number
  revshare_beeline_invest: number
  net_platform: number
}

interface PnlRow {
  partner_name: string
  gmv: number
  commission: number
  cashback: number
  net: number
}

export default function Finance() {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  const [periodStart, setPeriodStart] = useState(formatDate(monthStart))
  const [periodEnd, setPeriodEnd] = useState(formatDate(today))
  const [revShare, setRevShare] = useState<RevShareData | null>(null)
  const [pnl, setPnl] = useState<PnlRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!periodStart || !periodEnd) return
    setLoading(true)
    setError('')
    try {
      const params = { period_start: periodStart, period_end: periodEnd }
      const [revShareData, pnlData] = await Promise.all([
        api.get<RevShareData>('/admin/finance/revshare', params),
        api.get<PnlRow[]>('/admin/finance/pnl', params),
      ])
      setRevShare(revShareData)
      setPnl(pnlData)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCsv = () => {
    if (pnl.length === 0) return
    const headers = ['Партнёр', 'GMV', 'Комиссия', 'Кэшбэк', 'NET']
    const rows = pnl.map((row) => [
      row.partner_name,
      row.gmv.toString(),
      row.commission.toString(),
      row.cashback.toString(),
      row.net.toString(),
    ])
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pnl_${periodStart}_${periodEnd}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-beeline-black mb-6">Финансы</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Период отчёта</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <Input
              label="Начало периода"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
            <Input
              label="Конец периода"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
            <Button onClick={fetchData} disabled={loading}>
              {loading ? 'Загрузка...' : 'Сформировать'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {revShare && (
        <>
          <h2 className="text-lg font-semibold text-beeline-black mb-4">
            Rev Share
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard title="GMV" value={formatCurrency(revShare.gmv)} />
            <StatCard
              title="Комиссия"
              value={formatCurrency(revShare.commission)}
            />
            <StatCard
              title="Rev share Билайн (площадка)"
              value={formatCurrency(revShare.revshare_beeline_platform)}
            />
            <StatCard
              title="Rev share НСПК"
              value={formatCurrency(revShare.revshare_nspk)}
            />
            <StatCard
              title="Rev share Билайн (инвестиции)"
              value={formatCurrency(revShare.revshare_beeline_invest)}
            />
            <StatCard
              title="NET платформы"
              value={formatCurrency(revShare.net_platform)}
              className="border-beeline-yellow/30 bg-beeline-yellow/5"
            />
          </div>
        </>
      )}

      {pnl.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>P&L по партнёрам</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                Выгрузить CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Партнёр</TableHead>
                  <TableHead>GMV</TableHead>
                  <TableHead>Комиссия</TableHead>
                  <TableHead>Кэшбэк</TableHead>
                  <TableHead>NET</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pnl.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {row.partner_name}
                    </TableCell>
                    <TableCell>{formatCurrency(row.gmv)}</TableCell>
                    <TableCell>{formatCurrency(row.commission)}</TableCell>
                    <TableCell>{formatCurrency(row.cashback)}</TableCell>
                    <TableCell
                      className={row.net < 0 ? 'text-red-600 font-medium' : ''}
                    >
                      {formatCurrency(row.net)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!revShare && !loading && (
        <div className="flex items-center justify-center h-32">
          <p className="text-beeline-gray text-sm">
            Выберите период и нажмите "Сформировать" для просмотра отчётов
          </p>
        </div>
      )}
    </div>
  )
}
