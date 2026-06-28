export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDate(value: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  partial: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  unpaid: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
}

export function statusBadgeCls(status: string): string {
  return STATUS_STYLES[status] ?? STATUS_STYLES.unpaid
}
