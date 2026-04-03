import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'

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

    setTimeout(() => {
      setSpinning(false)
      setResult(segments[winIndex].value)
    }, 3000)
  }

  const handleAccept = async () => {
    if (!phoneHash || !offerId) return
    try {
      await api.post(`/client/${phoneHash}/activate/${offerId}`)
      navigate(`/client/${phoneHash}/thanks`)
    } catch {
      // Handle error
    }
  }

  return (
    <div className="min-h-screen bg-beeline-black flex flex-col items-center justify-center px-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        Крути барабан!
      </h1>
      <p className="text-gray-400 text-center text-sm mb-8">
        Узнай свой персональный кэшбэк
      </p>

      {/* Wheel */}
      <div className="relative w-72 h-72 mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-white" />
        </div>

        {/* Wheel SVG */}
        <div
          className="w-full h-full transition-transform ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? '3s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            {segments.map((seg, i) => {
              const angle = (360 / segments.length) * i
              const startAngle = (angle - 90) * (Math.PI / 180)
              const endAngle = (angle + 360 / segments.length - 90) * (Math.PI / 180)
              const x1 = 100 + 95 * Math.cos(startAngle)
              const y1 = 100 + 95 * Math.sin(startAngle)
              const x2 = 100 + 95 * Math.cos(endAngle)
              const y2 = 100 + 95 * Math.sin(endAngle)
              const largeArc = 360 / segments.length > 180 ? 1 : 0

              const midAngle = (angle + 360 / segments.length / 2 - 90) * (Math.PI / 180)
              const textX = 100 + 60 * Math.cos(midAngle)
              const textY = 100 + 60 * Math.sin(midAngle)

              return (
                <g key={i}>
                  <path
                    d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={seg.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontWeight="bold"
                    fontSize="18"
                    className="drop-shadow"
                  >
                    {seg.label}
                  </text>
                </g>
              )
            })}
            <circle cx="100" cy="100" r="20" fill="white" />
          </svg>
        </div>
      </div>

      {/* Result or Spin Button */}
      {result !== null ? (
        <div className="text-center animate-fade-in">
          <div className="bg-beeline-yellow rounded-2xl px-8 py-6 mb-6">
            <p className="text-sm font-medium text-beeline-black/70">Ваш кэшбэк</p>
            <p className="text-5xl font-bold text-beeline-black mt-2">{result}%</p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-white text-white hover:bg-white/10"
              onClick={() => {}}
            >
              К партнёру
            </Button>
            <Button size="lg" className="flex-1" onClick={handleAccept}>
              Отлично
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="lg"
          className="w-full max-w-xs text-lg"
          onClick={spin}
          disabled={spinning}
        >
          {spinning ? 'Крутим...' : 'Крутить!'}
        </Button>
      )}
    </div>
  )
}
