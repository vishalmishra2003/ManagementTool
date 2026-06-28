export function inputCls(error?: string) {
  return `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-300 dark:border-red-700 focus:ring-red-300 bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-gray-100'
      : 'border-gray-200 dark:border-gray-600 focus:ring-pink-300 focus:border-pink-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
  }`
}

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

export default function Field({ label, required, error, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-pink-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
