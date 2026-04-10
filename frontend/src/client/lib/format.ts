// ─── Date helpers ───

export function formatOfferDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  // For dates older than 60 days, show year
  if (Math.abs(diffDays) > 60 || d.getFullYear() !== now.getFullYear()) {
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}

export function daysUntil(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.ceil((d.getTime() - now.getTime()) / 86400000)
}

export function daysSince(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / 86400000)
}

export function isNewOffer(startDate: string): boolean {
  return daysSince(startDate) <= 7
}

export function isExpiringSoon(endDate: string): boolean {
  const days = daysUntil(endDate)
  return days > 0 && days <= 7
}
