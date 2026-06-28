interface LandingProps {
  onSelectForm: (form: 'admission' | 'english', mode: 'new' | 'view') => void
  onOpenFeeStructure: () => void
}

export default function Landing({ onSelectForm, onOpenFeeStructure }: LandingProps) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="text-center mb-10">
        <img
          src="/logo.png"
          alt="Apextron Tutorials"
          className="h-24 w-24 rounded-full object-cover mx-auto mb-4 shadow-md ring-4 ring-pink-100 dark:ring-pink-900/30"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Apextron Tutorial</h1>
        <p className="text-pink-600 font-semibold text-lg tracking-wide">Management Tool</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Add a new entry or view existing records</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        <CourseCard
          title="Admission Form"
          subtitle="New student admissions"
          onNew={() => onSelectForm('admission', 'new')}
          onView={() => onSelectForm('admission', 'view')}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          }
        />
        <CourseCard
          title="English Speaking"
          subtitle="English speaking course"
          onNew={() => onSelectForm('english', 'new')}
          onView={() => onSelectForm('english', 'view')}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          }
        />
        <button
          onClick={onOpenFeeStructure}
          className="group bg-white dark:bg-gray-800 border-2 border-pink-100 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center"
        >
          <div className="w-14 h-14 bg-pink-50 dark:bg-pink-900/20 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 rounded-full flex items-center justify-center mb-4 transition-colors">
            <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-pink-600 transition-colors">Fee Structure</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Standard-wise default fees</p>
        </button>
      </div>
    </main>
  )
}

function CourseCard({
  title,
  subtitle,
  onNew,
  onView,
  icon,
}: {
  title: string
  subtitle: string
  onNew: () => void
  onView: () => void
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-pink-100 dark:border-gray-700 rounded-2xl p-6 text-center shadow-sm">
      <div className="w-14 h-14 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">{subtitle}</p>
      <div className="flex gap-2">
        <button
          onClick={onNew}
          className="flex-1 px-3 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
        >
          New
        </button>
        <button
          onClick={onView}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          View Data
        </button>
      </div>
    </div>
  )
}
