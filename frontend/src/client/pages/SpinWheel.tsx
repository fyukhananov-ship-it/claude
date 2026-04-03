import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

const segments = [
  { value: 30, color: '#FFD500', label: '30%' },
  { value: 50, color: '#F59E0B', label: '50%' },
  { value: 70, color: '#EF4444', label: '70%' },
]

export default function SpinWheel() {
  const { phoneHash, offerId } = useParams<{ phoneHash: string; offerId: string }>()
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)

  const spin = () => {
    if (spinning) return
    setSpinning(true); setResult(null)
    const win = Math.floor(Math.random() * segments.length)
    const sa = 360 / segments.length
    setRotation(360 * 6 + (360 - win * sa - sa / 2))
    setTimeout(() => { setSpinning(false); setResult(segments[win].value) }, 3500)
  }

  const handleAccept = async () => {
    if (!phoneHash || !offerId) return
    try { await api.post(`/client/${phoneHash}/activate/${offerId}`); navigate(`/client/${phoneHash}/thanks`) } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] noise-bg relative flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#FFD500]/[0.06] rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-0 w-[200px] h-[200px] bg-purple-500/[0.04] rounded-full blur-[80px]" />

      <div className="relative z-10 text-center mb-8">
        <div className="w-14 h-14 rounded-3xl bg-[#FFD500]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#FFD500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
        </div>
        <h1 className="text-[26px] font-extrabold text-white tracking-[-0.03em]">Крути барабан!</h1>
        <p className="text-white/30 text-[13px] mt-2 font-medium">Узнай свой персональный кэшбэк</p>
      </div>

      {/* Wheel */}
      <div className="relative w-72 h-72 mb-10 z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 z-10">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-[#FFD500] drop-shadow-[0_0_12px_rgba(255,213,0,0.5)]" />
        </div>
        <div style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(0.13,0.67,0.08,0.99)' : 'none' }}>
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_40px_rgba(255,213,0,0.15)]">
            {segments.map((seg, i) => {
              const a = (360 / segments.length) * i, sa = (a-90)*Math.PI/180, ea = (a+120-90)*Math.PI/180
              const x1=100+95*Math.cos(sa), y1=100+95*Math.sin(sa), x2=100+95*Math.cos(ea), y2=100+95*Math.sin(ea)
              const ma=(a+60-90)*Math.PI/180, tx=100+58*Math.cos(ma), ty=100+58*Math.sin(ma)
              return (<g key={i}>
                <path d={`M100,100 L${x1},${y1} A95,95 0 0,1 ${x2},${y2} Z`} fill={seg.color} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fill="white" fontWeight="800" fontSize="22" fontFamily="JetBrains Mono" style={{textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{seg.label}</text>
              </g>)
            })}
            <circle cx="100" cy="100" r="24" fill="#1a1a1a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <circle cx="100" cy="100" r="20" fill="#222" />
            <text x="100" y="102" textAnchor="middle" dominantBaseline="central" fill="#FFD500" fontWeight="800" fontSize="8" fontFamily="JetBrains Mono">SPIN</text>
          </svg>
        </div>
      </div>

      {/* Result or spin */}
      <div className="relative z-10 w-full max-w-xs">
        {result !== null ? (
          <div className="text-center animate-stagger">
            <div className="bg-[#111] border border-white/[0.08] rounded-3xl px-8 py-8 mb-5">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Ваш кэшбэк</p>
              <p className="font-mono-cash text-[56px] font-extrabold gold-shimmer leading-none mt-3">{result}%</p>
              <p className="text-[12px] text-white/30 mt-3 font-medium">Персональная ставка</p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-3.5 rounded-2xl border border-white/10 text-white/70 font-bold text-[14px] press-scale">К партнёру</button>
              <button onClick={handleAccept} className="flex-1 py-3.5 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[14px] press-scale shadow-[0_4px_24px_rgba(255,213,0,0.35)]">Отлично</button>
            </div>
          </div>
        ) : (
          <button onClick={spin} disabled={spinning}
            className="w-full py-4 rounded-2xl bg-[#FFD500] text-[#111] font-extrabold text-[16px] press-scale disabled:opacity-70 shadow-[0_4px_32px_rgba(255,213,0,0.4)]">
            {spinning ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-[#111]/30 border-t-[#111] rounded-full animate-spin" />Крутим...</span> : 'Крутить!'}
          </button>
        )}
      </div>
    </div>
  )
}
