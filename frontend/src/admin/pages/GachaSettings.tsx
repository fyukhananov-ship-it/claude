import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { api } from '@/api/client'

interface OfferOption { id: string; name: string; partner_name: string; cashback_rate: string; cashback_type: string }

interface GachaDrop {
  offer_id: string
  rarity: 'legendary' | 'epic' | 'rare' | 'common'
  weight: number
}

const RARITY_CONFIG = {
  legendary: { label: 'Легендарный', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  epic:      { label: 'Эпический', color: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500' },
  rare:      { label: 'Редкий', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  common:    { label: 'Обычный', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
}

function fmtRate(o: OfferOption) {
  return o.cashback_type === 'percent'
    ? `${(parseFloat(o.cashback_rate) * 100).toFixed(0)}%`
    : `${parseFloat(o.cashback_rate).toFixed(0)} \u20BD`
}

export default function GachaSettings() {
  const [offers, setOffers] = useState<OfferOption[]>([])
  const [drops, setDrops] = useState<GachaDrop[]>([])
  const [pityMax, setPityMax] = useState(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get<OfferOption[]>('/admin/offers').catch(() => []),
      api.get<Record<string, string>>('/admin/settings').catch(() => ({})),
    ]).then(([o, s]) => {
      setOffers(Array.isArray(o) ? o : [])
      if (s.gacha_drops) {
        try { setDrops(JSON.parse(s.gacha_drops)) } catch {}
      }
      if (s.gacha_pity_max) {
        setPityMax(parseInt(s.gacha_pity_max) || 10)
      }
    }).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const addDrop = (offerId: string) => {
    if (drops.find(d => d.offer_id === offerId)) return
    setDrops(d => [...d, { offer_id: offerId, rarity: 'common', weight: 10 }])
  }

  const removeDrop = (offerId: string) => {
    setDrops(d => d.filter(x => x.offer_id !== offerId))
  }

  const updateDrop = (offerId: string, field: 'rarity' | 'weight', value: string | number) => {
    setDrops(d => d.map(x => x.offer_id === offerId ? { ...x, [field]: value } : x))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', {
        gacha_drops: JSON.stringify(drops),
        gacha_pity_max: String(pityMax),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {} finally { setSaving(false) }
  }

  const getOffer = (id: string) => offers.find(o => o.id === id)
  const availableOffers = offers.filter(o => !drops.find(d => d.offer_id === o.id))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Дроп офферов</h1>
          <p className="text-[13px] text-[#999] mt-1 font-medium">
            {drops.length} офферов в пуле, гарант каждые {pityMax} дропов
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale disabled:opacity-50 shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
          {saving ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить'}
        </button>
      </div>

      {/* Pity setting */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-bold text-[#111]">Гарантированный легендарный</p>
            <p className="text-[12px] text-[#999] mt-0.5">Каждые N дропов — гарантированный легендарный оффер</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#999]">Каждые</span>
            <input type="number" value={pityMax} onChange={e => setPityMax(parseInt(e.target.value) || 1)} min={1} max={100}
              className="w-16 px-3 py-2 rounded-xl border border-[#eee] text-[14px] font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" />
            <span className="text-[12px] text-[#999]">дропов</span>
          </div>
        </div>
      </div>

      {/* Add offer to pool */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 mb-5">
        <p className="text-[14px] font-bold text-[#111] mb-3">Добавить оффер в пул</p>
        <select
          onChange={e => { if (e.target.value) { addDrop(e.target.value); e.target.value = '' } }}
          className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40"
          defaultValue=""
        >
          <option value="" disabled>Выберите оффер</option>
          {availableOffers.map(o => (
            <option key={o.id} value={o.id}>{o.partner_name} — {o.name} ({fmtRate(o)})</option>
          ))}
        </select>
      </div>

      {/* Pool */}
      <div className="space-y-2">
        {drops.map(drop => {
          const offer = getOffer(drop.offer_id)
          const rc = RARITY_CONFIG[drop.rarity]
          return (
            <div key={drop.offer_id} className="bg-white rounded-2xl border border-[#f0f0f0] p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-2 h-2 rounded-full shrink-0', rc.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#111] truncate">
                    {offer ? `${offer.partner_name} — ${offer.name}` : drop.offer_id}
                  </p>
                  {offer && <p className="text-[11px] text-[#999] mt-0.5">Кэшбэк: {fmtRate(offer)}</p>}
                </div>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', rc.color)}>
                  {rc.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#f5f5f5]">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-[#999] uppercase tracking-[0.08em]">Редкость</label>
                  <select value={drop.rarity} onChange={e => updateDrop(drop.offer_id, 'rarity', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[#eee] text-[12px] focus:outline-none">
                    <option value="common">Обычный</option>
                    <option value="rare">Редкий</option>
                    <option value="epic">Эпический</option>
                    <option value="legendary">Легендарный</option>
                  </select>
                </div>
                <div className="w-20">
                  <label className="text-[10px] font-bold text-[#999] uppercase tracking-[0.08em]">Вес</label>
                  <input type="number" value={drop.weight} onChange={e => updateDrop(drop.offer_id, 'weight', parseInt(e.target.value) || 1)} min={1}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[#eee] text-[12px] text-center focus:outline-none" />
                </div>
                <button onClick={() => removeDrop(drop.offer_id)} className="mt-4 text-[11px] text-red-500 font-bold press-scale">
                  Убрать
                </button>
              </div>
            </div>
          )
        })}

        {drops.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#f0f0f0]">
            <p className="text-[14px] text-[#999]">Пул дропов пуст</p>
            <p className="text-[12px] text-[#ccc] mt-1">Добавьте офферы, чтобы настроить дропы</p>
          </div>
        )}
      </div>
    </div>
  )
}
