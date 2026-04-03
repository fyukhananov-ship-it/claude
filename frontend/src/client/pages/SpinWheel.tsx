import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

const segments = [
  { value: 30, color: '#FFD500', label: '30%' },
  { value: 50, color: '#F9A825', label: '50%' },
  { value: 70, color: '#E65100', label: '70%' },
]

export default function SpinWheel() {
  const { phoneHash, offerId } = useParams<{ phoneHash: string; offerId: string }>()
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    const winIndex = Math.floor(Math.random() * segments.length)
    const segmentAngle = 360 / segments.length
    const targetAngle = 360 * 5 + (360 - winIndex * segmentAngle - segmentAngle / 2)
    setRotation(targetAngle)
    setTimeout(() => { setSpinning(false); setResult(segments[winIndex].value) }, 3000)
  }

  const handleAccept = async () => {
    if (!phoneHash || !offerId) return
    try {
      await api.post(`/client/${phoneHash}/activate/${offerId}`)
      navigate(`/client/${phoneHash}/thanks`)
    } catch { /* */ }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-beeline-black via-[#1a1a2e] to-beeline-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-beeline-yellow/10 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-8 w-32 h-32 bg-brand-800/20 rounded-full blur-3xl" />

      {/* Title */}
      <div className="relative z-10 text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-beeline-yellow/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-beeline-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
        <h1 className="text-[24px] font-bold text-white">Крути барабан!</h1>
        <p className="text-gray-400 text-[13px] mt-1.5">Узнай свой персональный кэшбэк</p>
      </div>

      {/* Wheel */}
      <div className="relative w-72 h-72 mb-8 z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-beeline-yellow drop-shadow-lg" />
        </div>

        <div
          className="w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            {segments.map((seg, i) => {
              const angle = (360 / segments.length) * i
              const sa = (angle - 90) * (Math.PI / 180)
              const ea = (angle + 360 / segments.length - 90) * (Math.PI / 180)
              const x1 = 100 + 95 * Math.cos(sa)
              const y1 = 100 + 95 * Math.sin(sa)
              const x2 = 100 + 95 * Math.cos(ea)
              const y2 = 100 + 95 * Math.sin(ea)
              const ma = (angle + 60 - 90) * (Math.PI / 180)
              const tx = 100 + 60 * Math.cos(ma)
              const ty = 100 + 60 * Math.sin(ma)
              return (
                <g key={i}>
                  <path d={`M100,100 L${x1},${y1} A95,95 0 0,1 ${x2},${y2} Z`} fill={seg.color} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fill="white" fontWeight="800" fontSize="20" style={{textShadow:'0 1px 3px rgba(0,0,0,0.3)'}}>{seg.label}</text>
                </g>
              )
            })}
            <circle cx="100" cy="100" r="22" fill="white" />
            <circle cx="100" cy="100" r="18" fill="#f8f8f8" />
            <text x="100" y="101" textAnchor="middle" dominantBaseline="central" fill="#333" fontWeight="700" fontSize="8">SPIN</text>
          </svg>
        </div>
      </div>

      {/* Result or Spin Button */}
      <div className="relative z-10 w-full max-w-xs">
        {result !== null ? (
          <div className="text-center">
            <div className="bg-gradient-to-br from-beeline-yellow to-brand-600 rounded-3xl px-8 py-7 mb-5 shadow-xl shadow-yellow-500/20">
              <p className="text-[12px] font-semibold text-beeline-black/60 uppercase tracking-wider">Ваш кэшбэк</p>
              <p className="text-[52px] font-extrabold text-beeline-black leading-none mt-2">{result}%</p>
              <p className="text-[13px] text-beeline-black/60 mt-2">Персональная ставка</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {}}
                className="flex-1 py-3.5 rounded-2xl border border-white/20 text-white font-semibold text-[14px] hover:bg-white/5 transition-colors"
              >
                К партнёру
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-3.5 rounded-2xl bg-beeline-yellow text-beeline-black font-bold text-[14px] hover:bg-brand-600 active:scale-[0.98] transition-all shadow-lg shadow-yellow-400/30"
              >
                Отлично
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={spin}
            disabled={spinning}
            className="w-full py-4 rounded-2xl bg-beeline-yellow text-beeline-black font-bold text-[16px] hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-70 shadow-lg shadow-yellow-400/30"
          >
            {spinning ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-beeline-black/30 border-t-beeline-black rounded-full animate-spin" />
                Крутим...
              </span>
            ) : 'Крутить!'}
          </button>
        )}
      </div>
    </div>
  )
}
