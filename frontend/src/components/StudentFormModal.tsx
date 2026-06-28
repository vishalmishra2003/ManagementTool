import { useState } from 'react'
import type { CourseConfig } from '../config/courses'
import type { Student } from '../types'
import { updateStudent } from '../api/students'
import { formFromStudent, validateForm } from '../utils/studentForm'
import StudentFields from './StudentFields'

interface Props {
  config: CourseConfig
  student: Student
  onClose: () => void
  onSaved: (student: Student) => void
}

// Modal for editing an existing student's details (the Update flow that replaces Delete).
export default function StudentFormModal({ config, student, onClose, onSaved }: Props) {
  const [form, setForm] = useState(() => formFromStudent(config, student))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  async function handleSave() {
    const next = validateForm(config, form)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    setError(null)
    try {
      const updated = await updateStudent(config.course, student._id, form)
      onSaved(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Edit {student.name}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <StudentFields config={config} form={form} errors={errors} onChange={handleChange} />
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}
