import { useState, useRef } from 'react'
import { api } from '@/api/client'

interface Result { batch_id: string; total: number; matched: number; errors: number }

export default function RegistryUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const r = await api.uploadFile<Result>('/admin/registry/upload', file)
      setResult(r); setFile(null)
    } catch {} finally { setUploading(false) }
  }

  const handlePayout = async () => {
    try { await api.post('/payouts/generate', { period_start: '2026-03-01', period_end: '2026-04-03', type: 'client' }); alert('Реестр выплат сформирован') } catch {}
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-[#111] tracking-[-0.03em]">Реестры НСПК</h1>
        <p className="text-[13px] text-[#999] mt-1 font-medium">Загрузка и обработка транзакционных реестров</p>
      </div>

      {/* Upload zone */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-6">
        <h2 className="text-[16px] font-extrabold text-[#111] mb-4">Загрузить реестр</h2>
        <div
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f) }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => ref.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-[#FFD500] bg-[#FFD500]/5' : 'border-[#e0e0e0] hover:border-[#ccc]'}`}
        >
          <input ref={ref} type="file" accept=".csv,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
          <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          {file ? (
            <div>
              <p className="text-[14px] font-bold text-[#111]">{file.name}</p>
              <p className="text-[12px] text-[#999] mt-1">{(file.size / 1024).toFixed(1)} КБ</p>
            </div>
          ) : (
            <div>
              <p className="text-[14px] font-bold text-[#111]">Перетащите файл или нажмите для выбора</p>
              <p className="text-[12px] text-[#999] mt-1">CSV или JSON. Поля: transaction_id, phone_hash, terminal_id, mcc, amount, timestamp</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={handleUpload} disabled={!file || uploading}
            className="px-5 py-3 rounded-xl bg-[#FFD500] text-[#111] text-[13px] font-bold press-scale disabled:opacity-50 shadow-[0_2px_12px_rgba(255,213,0,0.25)]">
            {uploading ? 'Обработка...' : 'Загрузить и обработать'}
          </button>
          <button onClick={handlePayout}
            className="px-5 py-3 rounded-xl bg-[#111] text-white text-[13px] font-bold press-scale">
            Сформировать выплаты
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6">
          <h2 className="text-[16px] font-extrabold text-[#111] mb-5">Результат обработки</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Всего', value: result.total, color: 'text-[#111]' },
              { label: 'Matched', value: result.matched, color: 'text-emerald-600' },
              { label: 'Ошибки', value: result.errors, color: result.errors > 0 ? 'text-red-500' : 'text-[#111]' },
              { label: 'Match rate', value: result.total > 0 ? `${((result.matched / result.total) * 100).toFixed(1)}%` : '0%', color: 'text-[#FFD500]' },
            ].map(m => (
              <div key={m.label} className="bg-[#fafafa] rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.1em]">{m.label}</p>
                <p className={`font-mono-cash text-[24px] font-extrabold ${m.color} mt-1`}>{typeof m.value === 'number' ? m.value.toLocaleString('ru') : m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
