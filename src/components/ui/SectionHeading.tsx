interface SectionHeadingProps {
  eyebrow: string
  title: string
  centered?: boolean
}

export default function SectionHeading({ eyebrow, title, centered = true }: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <span className="inline-block font-sans font-medium text-warm-500 text-[13px] uppercase tracking-[0.1em] mb-3">
        {eyebrow}
      </span>
      <h2 className="font-serif font-semibold text-charcoal-900 text-[32px] lg:text-[44px] leading-[1.2] tracking-[-0.01em]">
        {title}
      </h2>
      {centered && (
        <div className="mx-auto mt-4 w-12 h-0.5 bg-warm-300" />
      )}
    </div>
  )
}
