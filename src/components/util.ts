export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return iso
  }
}
