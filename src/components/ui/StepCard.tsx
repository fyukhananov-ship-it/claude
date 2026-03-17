import type { Step } from '../../data/steps'

interface StepCardProps {
  step: Step
  delay?: number
}

export default function StepCard({ step, delay = 0 }: StepCardProps) {
  return (
    <div
      className="text-center flex-1"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 rounded-full bg-warm-50 border border-warm-200 flex items-center justify-center mx-auto mb-4">
        <span className="font-serif font-bold text-warm-500 text-4xl leading-none">
          {step.number}
        </span>
      </div>
      <h3 className="font-sans font-semibold text-charcoal-900 text-base mb-1">
        {step.title}
      </h3>
      <p className="font-sans text-charcoal-500 text-sm leading-relaxed">
        {step.description}
      </p>
    </div>
  )
}
