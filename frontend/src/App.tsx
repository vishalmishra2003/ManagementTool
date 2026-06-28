import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import Landing from './pages/Landing'
import StudentSection from './pages/StudentSection'
import FeeStructurePage from './pages/FeeStructurePage'
import { admissionConfig, englishConfig } from './config/courses'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const navigate = useNavigate()
  const { status, error, retry } = useAuth()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((d) => !d)}
        onOpenFeeStructure={() => navigate('/fee-structure')}
        onHome={() => navigate('/')}
      />

      {status === 'loading' && (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Signing in…
        </div>
      )}

      {status === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
          <p className="text-red-600 dark:text-red-400 font-medium">Could not connect to the server</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">{error}</p>
          <button onClick={retry} className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700">
            Retry
          </button>
        </div>
      )}

      {status === 'authenticated' && (
        <Routes>
          <Route
            path="/"
            element={
              <Landing
                onSelectForm={(form, mode) => navigate(`/${form}/${mode}`)}
                onOpenFeeStructure={() => navigate('/fee-structure')}
              />
            }
          />
          <Route path="/:course/:mode" element={<CoursePage />} />
          <Route path="/:course" element={<Navigate to="new" replace />} />
          <Route path="/fee-structure" element={<FeeStructurePage onBack={() => navigate('/')} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  )
}

const COURSE_CONFIGS = {
  admission: admissionConfig,
  english: englishConfig,
} as const

function CoursePage() {
  const { course, mode } = useParams<{ course: string; mode: string }>()
  const navigate = useNavigate()

  const config = course ? COURSE_CONFIGS[course as keyof typeof COURSE_CONFIGS] : undefined
  if (!config || (mode !== 'new' && mode !== 'view')) {
    return <Navigate to="/" replace />
  }

  return (
    <StudentSection
      key={config.course}
      config={config}
      mode={mode}
      onModeChange={(next) => navigate(`/${config.course}/${next}`)}
      onBack={() => navigate('/')}
    />
  )
}
