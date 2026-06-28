import type { CourseConfig } from '../config/courses'
import type { Student } from '../types'
import { formatDate, formatMoney, statusBadgeCls } from '../utils/format'

interface Props {
  config: CourseConfig
  student: Student
  onClose: () => void
  onEdit: () => void
  onManageFees: () => void
}

export default function StudentDetail({ config, student, onClose, onEdit, onManageFees }: Props) {
  const rec = student as unknown as Record<string, unknown>
  const s = student.feeSummary
  const payments = [...student.fees.payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-gray-800 h-full overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {student.standard}
              {'board' in student ? ` · ${student.board}` : ''}
              {'batch' in student ? ` · ${student.batch}` : ''}
              {' · '}Added {formatDate(student.createdAt)}
            </p>
          </div>
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

        <div className="p-5 space-y-6">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Edit Details
            </button>
            <button
              onClick={onManageFees}
              className="flex-1 px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
            >
              Manage Fees
            </button>
          </div>

          {/* Fee summary */}
          <section>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Fees
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <Stat label="Net" value={formatMoney(s.netFee)} />
              <Stat label="Paid" value={formatMoney(s.paid)} accent="text-green-600 dark:text-green-400" />
              <Stat label="Balance" value={formatMoney(s.balance)} accent="text-pink-600 dark:text-pink-400" />
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700/40 p-2.5">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${statusBadgeCls(s.status)}`}>
                  {s.status}
                </span>
              </div>
            </div>
          </section>

          {/* All details */}
          <section>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Student Details
            </h4>
            <dl className="divide-y divide-gray-100 dark:divide-gray-700">
              {config.fields.map((f) => (
                <div key={f.key} className="flex justify-between gap-4 py-2">
                  <dt className="text-xs text-gray-500 dark:text-gray-400">{f.label}</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100 text-right break-words">
                    {f.type === 'date'
                      ? formatDate(String(rec[f.key] ?? ''))
                      : String(rec[f.key] ?? '') || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Payment history */}
          <section>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Payment History ({payments.length})
            </h4>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-3">No payments recorded yet</p>
            ) : (
              <ul className="space-y-2">
                {payments.map((p) => (
                  <li key={p._id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatMoney(p.amount)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(p.date)} · {p.method}
                      {p.note ? ` · ${p.note}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/40 p-2.5">
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${accent ?? 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
    </div>
  )
}
