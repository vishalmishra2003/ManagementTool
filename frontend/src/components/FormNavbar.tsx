type FormMode = 'new' | 'view'

interface FormNavbarProps {
  title: string
  mode: FormMode
  onNew: () => void
  onView: () => void
  onBack: () => void
}

export default function FormNavbar({ title, mode, onNew, onView, onBack }: FormNavbarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNew}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              mode === 'new'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            New
          </button>
          <button
            onClick={onView}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              mode === 'view'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            View
          </button>
        </div>
      </div>
    </div>
  )
}
