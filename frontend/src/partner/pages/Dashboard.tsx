import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

const demoOffers = [
  { name: 'Кэшбэк 10% в Пятёрочке', status: 'active', rate: '10%', budget: 500000, spent: 123400 },
  { name: 'Скидка на первую покупку', status: 'moderation', rate: '300 ₽', budget: 100000, spent: 0 },
  { name: 'Летняя акция', status: 'draft', rate: '15%', budget: 200000, spent: 0 },
]

const statusBadge: Record<string, { label: string; variant: 'success' | 'info' | 'default' | 'warning' }> = {
  active: { label: 'Активный', variant: 'success' },
  moderation: { label: 'На модерации', variant: 'info' },
  draft: { label: 'Черновик', variant: 'default' },
  paused: { label: 'Приостановлен', variant: 'warning' },
}

export default function PartnerDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-beeline-black mb-6">Дашборд</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Активных офферов" value="1" />
        <StatCard title="Общий GMV" value={formatCurrency(1234567)} />
        <StatCard title="Начисленный кэшбэк" value={formatCurrency(123456)} />
        <StatCard title="Остаток бюджета" value={formatCurrency(376544)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Кэшбэк по дням</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-beeline-gray text-sm">
              График будет подключен к API
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последние офферы</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-medium text-beeline-gray">Название</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-beeline-gray">Статус</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-beeline-gray">Ставка</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-beeline-gray">Бюджет</th>
                  </tr>
                </thead>
                <tbody>
                  {demoOffers.map((o, i) => {
                    const st = statusBadge[o.status] || statusBadge.draft
                    return (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-4 py-3 font-medium">{o.name}</td>
                        <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                        <td className="px-4 py-3">{o.rate}</td>
                        <td className="px-4 py-3 text-right text-beeline-gray">
                          {formatCurrency(o.spent)} / {formatCurrency(o.budget)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
