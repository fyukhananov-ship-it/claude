import { useState, useEffect } from 'react'
import { api } from '@/api/client'

export default function BrandSettings() {
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<Record<string, string>>('/admin/settings')
      .then(s => {
        if (s.brand_name) setName(s.brand_name)
        if (s.brand_logo) setLogoUrl(s.brand_logo)
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', { brand_name: name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {} finally { setSaving(false) }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await api.uploadFile<{ logo_url: string }>('/admin/settings/logo', file)
      setLogoUrl(result.logo_url)
    } catch {} finally { setUploading(false) }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Бренд</h1>
        <p className="text-[13px] text-[#999] mt-1 font-medium">Настройка шапки клиентского приложения</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 max-w-lg">
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Название приложения</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="Med" />
            <p className="text-[11px] text-[#999] mt-1">Отображается в шапке клиентского интерфейса</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Логотип</label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border border-[#eee]" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                  <span className="text-white font-extrabold text-[18px]">{name?.[0] || 'M'}</span>
                </div>
              )}
              <div>
                <label className="px-4 py-2.5 rounded-xl bg-[#f0f0f0] text-[12px] font-bold cursor-pointer press-scale inline-block">
                  {uploading ? 'Загрузка...' : 'Загрузить логотип'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                <p className="text-[11px] text-[#999] mt-1">PNG, JPG или SVG, до 2 МБ</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-2">Предпросмотр шапки</label>
            <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4">
              <div className="flex items-center gap-2.5">
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center">
                    <span className="text-white font-extrabold text-[14px]">{name?.[0] || 'M'}</span>
                  </div>
                )}
                <span className="text-[22px] font-extrabold text-[#1C1917] tracking-[-0.03em]">{name || 'Med'}</span>
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale disabled:opacity-50 shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
            {saving ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
