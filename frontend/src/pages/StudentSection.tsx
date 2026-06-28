import { useEffect, useMemo, useState } from 'react'
import type { CourseConfig } from '../config/courses'
import type { Student } from '../types'
import { useStudents } from '../hooks/useStudents'
import { createStudent } from '../api/students'
import { downloadCSV } from '../utils/csvExport'
import { emptyForm, validateForm, type FormState } from '../utils/studentForm'
import { formatDate, formatMoney, statusBadgeCls } from '../utils/format'
import FormNavbar from '../components/FormNavbar'
import FeesPanel from '../components/FeesPanel'
import StudentDetail from '../components/StudentDetail'
import StudentFormModal from '../components/StudentFormModal'
import StudentFields from '../components/StudentFields'

interface Props {
  config: CourseConfig
  onBack: () => void
  mode: 'new' | 'view'
  onModeChange: (mode: 'new' | 'view') => void
}

const PAGE_SIZES = [5, 10, 50, 100, 'all'] as const
type PageSize = (typeof PAGE_SIZES)[number]

export default function StudentSection({ config, onBack, mode, onModeChange }: Props) {
  const [standardFilter, setStandardFilter] = useState('')
  const [pageSize, setPageSize] = useState<PageSize>(10)
  const [page, setPage] = useState(1)

  const filter = useMemo(
    () => (standardFilter ? { standard: standardFilter } : {}),
    [standardFilter],
  )
  const { students, loading, error, refresh, setStudents } = useStudents(config.course, filter)

  // ── New form state ──
  const [form, setForm] = useState<FormState>(() => emptyForm(config))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Modals ──
  const [feesStudent, setFeesStudent] = useState<Student | null>(null)
  const [detailStudent, setDetailStudent] = useState<Student | null>(null)
  const [editStudent, setEditStudent] = useState<Student | null>(null)

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  async function handleSave() {
    const next = validateForm(config, form)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    setSaveError(null)
    try {
      const created = await createStudent(config.course, form)
      setSaved(true)
      setForm(emptyForm(config))
      await refresh()
      onModeChange('view')
      // Redirect straight to the fees panel for the new student.
      setFeesStudent(created)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setForm(emptyForm(config))
    setErrors({})
  }

  // Sync an updated student into the list and any open modal showing it.
  function applyUpdated(updated: Student) {
    setStudents((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
    setFeesStudent((cur) => (cur && cur._id === updated._id ? updated : cur))
    setDetailStudent((cur) => (cur && cur._id === updated._id ? updated : cur))
  }

  function handleDownload() {
    const data = students.map((r, i) => {
      const rec = r as unknown as Record<string, unknown>
      const row: Record<string, string> = { 'Sr. No.': String(i + 1) }
      for (const f of config.fields) row[f.label] = String(rec[f.key] ?? '')
      row['Total Fee'] = String(r.feeSummary.totalFee)
      row['Discount'] = String(r.feeSummary.discount)
      row['Net Fee'] = String(r.feeSummary.netFee)
      row['Paid'] = String(r.feeSummary.paid)
      row['Balance'] = String(r.feeSummary.balance)
      row['Fee Status'] = r.feeSummary.status
      row['Submitted On'] = formatDate(r.createdAt)
      return row
    })
    const suffix = standardFilter ? `_${standardFilter}` : '_all'
    downloadCSV(data, `${config.course}_students${suffix}.csv`)
  }

  const standards = useMemo(
    () => Array.from(new Set(students.map((s) => s.standard))).filter(Boolean).sort(),
    [students],
  )

  // ── Pagination (client-side over the fetched list) ──
  const total = students.length
  const size = pageSize === 'all' ? total : pageSize
  const pageCount = Math.max(1, size > 0 ? Math.ceil(total / size) : 1)
  const offset = pageSize === 'all' ? 0 : (page - 1) * size
  const pageStudents = pageSize === 'all' ? students : students.slice(offset, offset + size)

  // Reset to page 1 when the filter or page size changes.
  useEffect(() => {
    setPage(1)
  }, [standardFilter, pageSize])

  // Clamp page if the list shrinks below the current page.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <FormNavbar
        title={config.title}
        mode={mode}
        onNew={() => onModeChange('new')}
        onView={() => onModeChange('view')}
        onBack={onBack}
      />

      {mode === 'new' ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 px-4 py-6">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              {saved && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm font-medium">
                  Form saved successfully!
                </div>
              )}
              {saveError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm font-medium">
                  {saveError}
                </div>
              )}
              <StudentFields config={config} form={form} errors={errors} onChange={handleChange} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 px-4 py-6">
          <div className="max-w-full mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  {students.length} record{students.length !== 1 ? 's' : ''}
                </h3>
                <select
                  value={standardFilter}
                  onChange={(e) => setStandardFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
                >
                  <option value="">All standards</option>
                  {standards.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={String(pageSize)}
                  onChange={(e) =>
                    setPageSize(e.target.value === 'all' ? 'all' : (Number(e.target.value) as PageSize))
                  }
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
                  title="Rows per page"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={String(s)}>
                      {s === 'all' ? 'All' : `${s} / page`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleDownload}
                disabled={students.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400">
                Loading…
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-500">
                <p className="font-medium">No records yet</p>
                <p className="text-sm mt-1">
                  Click <span className="text-pink-600 font-medium">New</span> to add the first record
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 text-xs uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 font-semibold">#</th>
                        {config.columns.map((c) => (
                          <th key={c.key} className="px-4 py-3 whitespace-nowrap font-semibold">{c.label}</th>
                        ))}
                        <th className="px-4 py-3 whitespace-nowrap font-semibold">Net Fee</th>
                        <th className="px-4 py-3 whitespace-nowrap font-semibold">Paid</th>
                        <th className="px-4 py-3 whitespace-nowrap font-semibold">Balance</th>
                        <th className="px-4 py-3 whitespace-nowrap font-semibold">Status</th>
                        <th className="px-4 py-3 whitespace-nowrap font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {pageStudents.map((r, i) => {
                        const rec = r as unknown as Record<string, unknown>
                        return (
                          <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3 text-gray-400 dark:text-gray-500 font-medium">{offset + i + 1}</td>
                            {config.columns.map((c, ci) => (
                              <td key={c.key} className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                {ci === 0 ? (
                                  <button
                                    onClick={() => setDetailStudent(r)}
                                    className="font-medium text-gray-900 dark:text-gray-100 hover:text-pink-600 dark:hover:text-pink-400 hover:underline"
                                  >
                                    {String(rec[c.key] ?? '')}
                                  </button>
                                ) : c.badge ? (
                                  <span className="px-2 py-0.5 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 rounded text-xs font-medium">
                                    {String(rec[c.key] ?? '')}
                                  </span>
                                ) : (
                                  String(rec[c.key] ?? '')
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatMoney(r.feeSummary.netFee)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-green-600 dark:text-green-400">{formatMoney(r.feeSummary.paid)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-pink-600 dark:text-pink-400">{formatMoney(r.feeSummary.balance)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${statusBadgeCls(r.feeSummary.status)}`}>
                                {r.feeSummary.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <button
                                onClick={() => setDetailStudent(r)}
                                className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => setEditStudent(r)}
                                className="ml-2 px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setFeesStudent(r)}
                                className="ml-2 px-3 py-1 rounded bg-pink-600 text-white text-xs font-medium hover:bg-pink-700 transition-colors"
                              >
                                Fees
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {pageSize !== 'all' && pageCount > 1 && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Showing {offset + 1}–{Math.min(offset + size, total)} of {total}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Prev
                      </button>
                      <span className="text-gray-600 dark:text-gray-300">
                        Page {page} of {pageCount}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        disabled={page >= pageCount}
                        className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {feesStudent && (
        <FeesPanel
          course={config.course}
          variantField={config.variantField}
          student={feesStudent}
          onClose={() => setFeesStudent(null)}
          onUpdated={applyUpdated}
        />
      )}

      {detailStudent && (
        <StudentDetail
          config={config}
          student={detailStudent}
          onClose={() => setDetailStudent(null)}
          onEdit={() => setEditStudent(detailStudent)}
          onManageFees={() => {
            const s = detailStudent
            setDetailStudent(null)
            setFeesStudent(s)
          }}
        />
      )}

      {editStudent && (
        <StudentFormModal
          config={config}
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSaved={(updated) => {
            applyUpdated(updated)
            setEditStudent(null)
          }}
        />
      )}
    </div>
  )
}
