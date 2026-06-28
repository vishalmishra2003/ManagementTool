import { useEffect, useRef, useState } from 'react'
import type { Course, FeeStructure } from '../types'
import { refreshFeeStructures, upsertFeeStructure } from '../api/feeStructures'
import { admissionConfig, englishConfig } from '../config/courses'
import { formatMoney } from '../utils/format'
import { inputCls } from '../components/Field'

interface Props {
  onBack: () => void
}

const COURSES: { course: Course; label: string }[] = [
  { course: 'admission', label: 'Admission' },
  { course: 'english', label: 'English Speaking' },
]

export default function FeeStructurePage({ onBack }: Props) {
  const [course, setCourse] = useState<Course>('admission')
  const [structures, setStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [standard, setStandard] = useState('')
  const [variant, setVariant] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const cfg = course === 'admission' ? admissionConfig : englishConfig

  function handleEdit(s: FeeStructure) {
    setStandard(s.standard)
    setVariant(s.variant)
    setAmount(String(s.amount))
    setError(null)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setStructures(await refreshFeeStructures(course))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course])

  async function handleAdd() {
    if (!standard.trim() || !variant.trim() || !amount) {
      setError('Standard, ' + cfg.variantField + ' and amount are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await upsertFeeStructure({ course, standard: standard.trim(), variant: variant.trim(), amount: Number(amount) })
      setStandard('')
      setVariant('')
      setAmount('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-pink-600 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Standard-wise Fee Structure</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Course tabs */}
          <div className="flex gap-2">
            {COURSES.map((c) => (
              <button
                key={c.course}
                onClick={() => setCourse(c.course)}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                  course === c.course
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Add form */}
          <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Add / Update Default Fee</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              Entering an existing standard + {cfg.variantField} updates its fee.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Standard</label>
                <input value={standard} onChange={(e) => setStandard(e.target.value)} placeholder="e.g. 10th" className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">{cfg.variantField}</label>
                <select value={variant} onChange={(e) => setVariant(e.target.value)} className={inputCls()}>
                  <option value="">Select {cfg.variantField}</option>
                  {cfg.variantOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</label>
                <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls()} />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="w-full px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-400">Loading…</div>
            ) : structures.length === 0 ? (
              <div className="p-10 text-center text-gray-400 dark:text-gray-500">No fee structures defined yet</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Standard</th>
                    <th className="px-4 py-3 font-semibold capitalize">{cfg.variantField}</th>
                    <th className="px-4 py-3 font-semibold">Default Fee</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {structures.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{s.standard}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.variant}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(s.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(s)}
                          className="px-3 py-1 rounded text-xs font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
