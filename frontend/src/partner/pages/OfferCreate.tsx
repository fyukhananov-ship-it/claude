import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function OfferCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    cashback_type: 'percent',
    cashback_rate: '',
    min_check: '',
    max_cashback_per_tx: '',
    max_cashback_per_client: '',
    budget: '',
    start_date: '',
    end_date: '',
    segment: 'all',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [terminalsFile, setTerminalsFile] = useState<File | null>(null)
  const [placements, setPlacements] = useState({
    catalog: true,
    banner: false,
    push: false,
    stories: false,
  })
  const [cpmRates, setCpmRates] = useState({ banner: '', push: '', stories: '' })

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const rate = form.cashback_type === 'percent'
        ? parseFloat(form.cashback_rate) / 100
        : parseFloat(form.cashback_rate)

      const offer = await api.post<{ id: string }>('/offers', {
        ...form,
        cashback_rate: rate,
        min_check: parseFloat(form.min_check),
        max_cashback_per_tx: parseFloat(form.max_cashback_per_tx),
        max_cashback_per_client: parseFloat(form.max_cashback_per_client),
        budget: parseFloat(form.budget),
      })

      if (imageFile) {
        await api.uploadFile(`/offers/${offer.id}/image`, imageFile)
      }

      if (terminalsFile) {
        await api.uploadFile(`/offers/${offer.id}/terminals`, terminalsFile)
      }

      const placementList = Object.entries(placements)
        .filter(([, enabled]) => enabled)
        .map(([type]) => ({
          placement_type: type,
          cpm_rate: type !== 'catalog' ? parseFloat(cpmRates[type as keyof typeof cpmRates] || '0') : null,
          budget: null,
        }))

      if (placementList.length > 0) {
        await api.post(`/offers/${offer.id}/placements`, placementList)
      }

      navigate('/partner/offers')
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-beeline-black mb-6">Создать оффер</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Basic info */}
        <Card>
          <CardHeader><CardTitle>Основные данные</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Название" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-beeline-dark mb-1.5">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-beeline-yellow text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-beeline-dark mb-1.5">Изображение</label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cashback */}
        <Card>
          <CardHeader><CardTitle>Кэшбэк</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Тип кэшбэка"
              value={form.cashback_type}
              onChange={(e) => update('cashback_type', e.target.value)}
              options={[
                { value: 'percent', label: 'Процент от чека' },
                { value: 'fixed', label: 'Фиксированная сумма' },
              ]}
            />
            <Input
              label={form.cashback_type === 'percent' ? 'Ставка (%)' : 'Сумма (₽)'}
              type="number"
              value={form.cashback_rate}
              onChange={(e) => update('cashback_rate', e.target.value)}
              placeholder={form.cashback_type === 'percent' ? '10' : '300'}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Мин. чек (₽)" type="number" value={form.min_check} onChange={(e) => update('min_check', e.target.value)} required />
              <Input label="Макс. кэшбэк/транзакция (₽)" type="number" value={form.max_cashback_per_tx} onChange={(e) => update('max_cashback_per_tx', e.target.value)} required />
            </div>
            <Input label="Макс. кэшбэк на клиента за период (₽)" type="number" value={form.max_cashback_per_client} onChange={(e) => update('max_cashback_per_client', e.target.value)} required />
          </CardContent>
        </Card>

        {/* Period & Budget */}
        <Card>
          <CardHeader><CardTitle>Период и бюджет</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Дата начала" type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} required />
              <Input label="Дата окончания" type="date" value={form.end_date} onChange={(e) => update('end_date', e.target.value)} required />
            </div>
            <Input label="Бюджет кампании (₽)" type="number" value={form.budget} onChange={(e) => update('budget', e.target.value)} required />
          </CardContent>
        </Card>

        {/* Segment */}
        <Card>
          <CardHeader><CardTitle>Сегмент</CardTitle></CardHeader>
          <CardContent>
            <Select
              label="Сегмент клиентов"
              value={form.segment}
              onChange={(e) => update('segment', e.target.value)}
              options={[
                { value: 'all', label: 'Все клиенты' },
                { value: 'new', label: 'Новые (не покупали у партнёра)' },
                { value: 'existing', label: 'Существующие' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Terminals */}
        <Card>
          <CardHeader><CardTitle>Терминалы</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setTerminalsFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <p className="text-xs text-beeline-gray mt-2">CSV файл с колонками: terminal_id, mcc (опционально)</p>
              {terminalsFile && <p className="text-sm text-green-600 mt-1">{terminalsFile.name}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Placements */}
        <Card>
          <CardHeader><CardTitle>Плейсменты</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={placements.catalog} onChange={(e) => setPlacements((p) => ({ ...p, catalog: e.target.checked }))} className="rounded" />
              <span className="text-sm">Каталог офферов <span className="text-beeline-gray">(бесплатно)</span></span>
            </label>
            {(['banner', 'push', 'stories'] as const).map((type) => (
              <div key={type}>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={placements[type]}
                    onChange={(e) => setPlacements((p) => ({ ...p, [type]: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">
                    {type === 'banner' ? 'Баннер на главной' : type === 'push' ? 'Push-уведомление' : 'Stories'}
                    <span className="text-beeline-gray"> (CPM)</span>
                  </span>
                </label>
                {placements[type] && (
                  <div className="ml-8 mt-2">
                    <Input
                      label="Ставка CPM (₽)"
                      type="number"
                      value={cpmRates[type]}
                      onChange={(e) => setCpmRates((r) => ({ ...r, [type]: e.target.value }))}
                      placeholder="50"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={() => navigate('/partner/offers')}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Создать оффер'}
          </Button>
        </div>
      </form>
    </div>
  )
}
