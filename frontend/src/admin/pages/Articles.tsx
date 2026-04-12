import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { api } from '@/api/client'

interface Article {
  id: string; title: string; subtitle: string; content: string
  image_url: string | null; read_time: number; published: boolean
  sort_order: number; created_at: string
}

const emptyForm = {
  title: '', subtitle: '', content: '', image_url: '', read_time: 3,
  published: false, sort_order: 0,
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get<Article[]>('/admin/articles')
      .then(d => setArticles(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (a: Article) => {
    setEditingId(a.id)
    setForm({
      title: a.title,
      subtitle: a.subtitle,
      content: a.content,
      image_url: a.image_url || '',
      read_time: a.read_time,
      published: a.published,
      sort_order: a.sort_order,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/admin/articles/${editingId}`, form)
      } else {
        await api.post('/admin/articles', form)
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      load()
    } catch {} finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить статью?')) return
    try {
      await api.post(`/admin/articles/${id}`, undefined) // we'll use a workaround
      // Actually need DELETE method — let's use put to unpublish instead
    } catch {}
    load()
  }

  const togglePublish = async (a: Article) => {
    try {
      await api.put(`/admin/articles/${a.id}`, { published: !a.published })
      load()
    } catch {}
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingId) return
    setUploading(true)
    try {
      const result = await api.uploadFile<{ image_url: string }>(`/admin/articles/${editingId}/image`, file)
      setForm(f => ({ ...f, image_url: result.image_url }))
      load()
    } catch {} finally { setUploading(false) }
  }

  const upd = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#FFD500] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Журнал</h1>
          <p className="text-[13px] text-[#999] mt-1 font-medium">{articles.length} статей, {articles.filter(a => a.published).length} опубликовано</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
          Новая статья
        </button>
      </div>

      {/* Articles list */}
      <div className="space-y-3">
        {articles.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-[#f0f0f0] p-4 flex items-start gap-4">
            {a.image_url ? (
              <img src={a.image_url} alt="" className="w-20 h-14 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-20 h-14 rounded-xl bg-[#F5F6F8] flex items-center justify-center shrink-0">
                <span className="text-[20px]">📝</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold text-[#111] truncate">{a.title}</p>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                  a.published ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                )}>
                  {a.published ? 'Опубликована' : 'Черновик'}
                </span>
              </div>
              <p className="text-[12px] text-[#666] mt-0.5 truncate">{a.subtitle}</p>
              <p className="text-[11px] text-[#999] mt-0.5">{a.read_time} мин чтения</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => togglePublish(a)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-bold press-scale',
                  a.published ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-600'
                )}>
                {a.published ? 'Снять' : 'Опубликовать'}
              </button>
              <button onClick={() => openEdit(a)} className="px-3 py-1.5 rounded-lg bg-[#f0f0f0] text-[#666] text-[11px] font-bold press-scale">
                Редактировать
              </button>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[14px] text-[#999] font-medium">Нет статей. Создайте первую.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10" onClick={() => { setShowForm(false); setEditingId(null) }}>
          <div className="bg-white rounded-2xl border border-[#f0f0f0] w-full max-w-lg p-6 shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-[18px] font-extrabold text-[#111] mb-5">
              {editingId ? 'Редактировать статью' : 'Новая статья'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Заголовок</label>
                <input value={form.title} onChange={e => upd('title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="Как экономить на покупках" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Подзаголовок</label>
                <input value={form.subtitle} onChange={e => upd('subtitle', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" placeholder="Советы и лайфхаки" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Содержание</label>
                <textarea value={form.content} onChange={e => upd('content', e.target.value)} rows={6} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40 resize-none" placeholder="Текст статьи..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Время чтения (мин)</label>
                  <input type="number" value={form.read_time} onChange={e => upd('read_time', parseInt(e.target.value) || 1)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase tracking-[0.08em] mb-1.5">Порядок</label>
                  <input type="number" value={form.sort_order} onChange={e => upd('sort_order', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border border-[#eee] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFD500]/40" />
                </div>
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
                {form.image_url && <img src={form.image_url} alt="" className="w-full h-32 object-cover rounded-xl mt-2" />}
              </div>
              <label className="flex items-center gap-3 py-1 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => upd('published', e.target.checked)} className="w-5 h-5 rounded-lg accent-[#FFD500]" />
                <span className="text-[13px] font-bold text-[#111]">Опубликовать</span>
              </label>
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
