import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { api } from '@/api/client'

interface BannerItem {
  id: string; title: string; subtitle: string; partner_name: string
  partner_logo_url: string | null
  image_url: string | null; cta_text: string; offer_id: string | null
  enabled: boolean; sort_order: number
}

interface OfferOption { id: string; name: string; partner_name: string }

const emptyForm = {
  title: '', subtitle: '', partner_name: '', cta_text: 'Перейти',
  offer_id: '', enabled: true, sort_order: 0, image_url: '', partner_logo_url: '',
}

export default function Banners() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [offers, setOffers] = useState<OfferOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get<BannerItem[]>('/admin/banners').catch(() => []),
      api.get<OfferOption[]>('/admin/offers').catch(() => []),
    ]).then(([b, o]) => {
      setBanners(Array.isArray(b) ? b : [])
      setOffers(Array.isArray(o) ? o : [])
    }).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (b: BannerItem) => {
    setEditingId(b.id)
    setForm({
      title: b.title, subtitle: b.subtitle, partner_name: b.partner_name,
      cta_text: b.cta_text, offer_id: b.offer_id || '', enabled: b.enabled,
      sort_order: b.sort_order, image_url: b.image_url || '',
      partner_logo_url: b.partner_logo_url || '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, offer_id: form.offer_id || null }
      if (editingId) {
        await api.put(`/admin/banners/${editingId}`, payload)
      } else {
        await api.post('/admin/banners', payload)
      }
      setShowForm(false)
      setEditingId(null)
      load()
    } catch {} finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить баннер?')) return
    try {
      await api.put(`/admin/banners/${id}`, { enabled: false })
      load()
    } catch {}
  }

  const toggleEnabled = async (b: BannerItem) => {
    try {
      await api.put(`/admin/banners/${b.id}`, { enabled: !b.enabled })
      load()
    } catch {}
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingId) return
    setUploading(true)
    try {
      const result = await api.uploadFile<{ image_url: string }>(`/admin/banners/${editingId}/image`, file)
      setForm(f => ({ ...f, image_url: result.image_url }))
      load()
    } catch {} finally { setUploading(false) }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingId) return
    setUploadingLogo(true)
    try {
      const result = await api.uploadFile<{ partner_logo_url: string }>(`/admin/banners/${editingId}/partner-logo`, file)
      setForm(f => ({ ...f, partner_logo_url: result.partner_logo_url }))
      load()
    } catch {} finally { setUploadingLogo(false) }
  }

  const upd = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Баннеры</h1>
          <p className="text-[13px] text-[#999] mt-1 font-medium">{banners.length} баннеров, {banners.filter(b => b.enabled).length} активных</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
          Добавить баннер
        </button>
      </div>

      <div className="space-y-3">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-[#f0f0f0] p-4 flex items-start gap-4">
            {b.image_url ? (
              <img src={b.image_url} alt="" className="w-24 h-16 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-24 h-16 rounded-xl bg-[#F5F6F8] flex items-center justify-center shrink-0">
                <span className="text-[20px] opacity-40">🖼️</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold text-[#111] truncate">{b.title || 'Без названия'}</p>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                  b.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                )}>
                  {b.enabled ? 'Активен' : 'Скрыт'}
                </span>
              </div>
              <p className="text-[12px] text-[#666] mt-0.5 truncate">{b.partner_name}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => toggleEnabled(b)}
                className={cn('px-3 py-1.5 rounded-lg text-[11px] font-bold press-scale',
                  b.enabled ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-600'
                )}>
                {b.enabled ? 'Скрыть' : 'Показать'}
              </button>
              <button onClick={() => openEdit(b)} className="px-3 py-1.5 rounded-lg bg-[#f0f0f0] text-[#666] text-[11px] font-bold press-scale">
                Изменить
              </button>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[14px] text-[#999]">Нет баннеров. Создайте первый.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10" onClick={() => { setShowForm(false); setEditingId(null) }}>
          <div className="bg-white rounded-2xl border border-[#f0f0f0] w-full max-w-lg p-6 shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-[18px] font-extrabold text-[#111] mb-5">
              {editingId ? 'Редактировать баннер' : 'Новый баннер'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Заголовок</label>
                <input value={form.title} onChange={e => upd('title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="Сияйте сегодня, платите потом" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Подзаголовок</label>
                <input value={form.subtitle} onChange={e => upd('subtitle', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="Сплитуйте на 6 месяцев без переплат" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Партнёр</label>
                <input value={form.partner_name} onChange={e => upd('partner_name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="585*Золотой" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Логотип партнёра</label>
                <div className="flex gap-3 items-center">
                  {form.partner_logo_url ? (
                    <img src={form.partner_logo_url} alt="" className="w-12 h-12 rounded-full object-cover border border-[#eee]" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#F5F6F8] flex items-center justify-center">
                      <span className="text-[18px] text-[#9CA3AF]">{form.partner_name?.[0] || '?'}</span>
                    </div>
                  )}
                  <input value={form.partner_logo_url} onChange={e => upd('partner_logo_url', e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="URL или загрузите" />
                  {editingId && (
                    <label className="px-4 py-3 rounded-xl bg-[#f0f0f0] text-[12px] font-bold cursor-pointer press-scale shrink-0">
                      {uploadingLogo ? '...' : 'Загрузить'}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Текст кнопки</label>
                <input value={form.cta_text} onChange={e => upd('cta_text', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="Перейти" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Привязка к офферу</label>
                <select value={form.offer_id} onChange={e => upd('offer_id', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40">
                  <option value="">Без привязки</option>
                  {offers.map(o => (
                    <option key={o.id} value={o.id}>{o.partner_name} — {o.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Изображение</label>
                <div className="flex gap-3 items-center">
                  <input value={form.image_url} onChange={e => upd('image_url', e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="URL или загрузите" />
                  {editingId && (
                    <label className="px-4 py-3 rounded-xl bg-[#f0f0f0] text-[12px] font-bold cursor-pointer press-scale shrink-0">
                      {uploading ? '...' : 'Загрузить'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
                {form.image_url && <img src={form.image_url} alt="" className="w-full h-40 object-cover rounded-xl mt-2" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.enabled} onChange={e => upd('enabled', e.target.checked)} className="w-5 h-5 rounded-lg accent-[#FFD500]" />
                  <span className="text-[13px] font-bold text-[#111]">Активен</span>
                </label>
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Порядок</label>
                  <input type="number" value={form.sort_order} onChange={e => upd('sort_order', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); setEditingId(null) }} className="flex-1 py-3 rounded-xl bg-[#f0f0f0] text-[#666] text-[13px] font-bold press-scale">Отмена</button>
                <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 py-3 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale disabled:opacity-50">
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
