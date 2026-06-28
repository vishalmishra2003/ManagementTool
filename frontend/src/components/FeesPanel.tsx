import { useEffect, useState } from 'react'
import type { Course, FeeSummary, Student } from '../types'
import { addPayment, deletePayment, setFees } from '../api/students'
import { getFeeStructures, readFeeStructuresCache } from '../api/feeStructures'
import { formatDate, formatMoney, statusBadgeCls } from '../utils/format'
import { inputCls } from './Field'

interface Props {
  course: Course
  variantField: 'board' | 'batch'
  student: Student
  onClose: () => void
  onUpdated: (student: Student) => void
}

export default function FeesPanel({ course, variantField, student, onClose, onUpdated }: Props) {
  const summary = student.feeSummary
  const [totalFee, setTotalFee] = useState(String(student.fees.totalFee || ''))
  const [discount, setDiscount] = useState(String(student.fees.discount || ''))
  const [savingFee, setSavingFee] = useState(false)

  // Standard-wise default fee from the Fee Structure, matched on standard + board/batch.
  const variantValue = String((student as unknown as Record<string, unknown>)[variantField] ?? '')
  const [defaultFee, setDefaultFee] = useState<number | null>(null)
  // Only show the loading state on a cache miss; a cache hit resolves instantly.
  const [loadingDefault, setLoadingDefault] = useState(() => readFeeStructuresCache(course) == null)

  useEffect(() => {
    let active = true
    setLoadingDefault(readFeeStructuresCache(course) == null)
    getFeeStructures(course)
      .then((structures) => {
        if (!active) return
        const match = structures.find(
          (s) => s.standard === student.standard && s.variant === variantValue,
        )
        const amount = match ? match.amount : null
        setDefaultFee(amount)
        // Prefill total fee from the default when none is set yet.
        if (amount != null && !student.fees.totalFee) setTotalFee(String(amount))
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingDefault(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, student._id])

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [method, setMethod] = useState('Cash')
  const [note, setNote] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)

  const [error, setError] = useState<string | null>(null)

  async function handleSaveFee() {
    setSavingFee(true)
    setError(null)
    try {
      const updated = await setFees(course, student._id, Number(totalFee) || 0, Number(discount) || 0)
      onUpdated(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fee')
    } finally {
      setSavingFee(false)
    }
  }

  async function handleAddPayment() {
    if (!amount || Number(amount) <= 0) {
      setError('Enter a valid payment amount')
      return
    }
    setSavingPayment(true)
    setError(null)
    try {
      const updated = await addPayment(course, student._id, {
        amount: Number(amount),
        date,
        method,
        note,
      })
      onUpdated(updated)
      setAmount('')
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setSavingPayment(false)
    }
  }

  async function handleDeletePayment(paymentId: string) {
    setError(null)
    try {
      const updated = await deletePayment(course, student._id, paymentId)
      onUpdated(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment')
    }
  }

  const payments = [...student.fees.payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Until a fee is saved, fall back to the standard-wise default so the
  // summary reflects what's owed instead of showing 0.
  const displaySummary =
    !student.fees.totalFee && defaultFee != null
      ? (() => {
          const netFee = Math.max(defaultFee - summary.discount, 0)
          const balance = Math.max(netFee - summary.paid, 0)
          const status: FeeSummary['status'] =
            summary.paid >= netFee && netFee > 0 ? 'paid' : summary.paid > 0 ? 'partial' : 'unpaid'
          return { ...summary, netFee, balance, status }
        })()
      : summary

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-gray-800 h-full overflow-y-auto shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{student.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {student.standard}
              {'board' in student ? ` · ${student.board}` : ''}
              {'batch' in student ? ` · ${student.batch}` : ''}
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
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Summary */}
          {loadingDefault ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400 dark:text-gray-500 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading…
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Net Fee" value={formatMoney(displaySummary.netFee)} />
              <Stat label="Paid" value={formatMoney(displaySummary.paid)} accent="text-green-600 dark:text-green-400" />
              <Stat label="Balance" value={formatMoney(displaySummary.balance)} accent="text-pink-600 dark:text-pink-400" />
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700/40 p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${statusBadgeCls(displaySummary.status)}`}>
                  {displaySummary.status}
                </span>
              </div>
            </div>
          )}

          {/* Set fee + discount */}
          <section>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Fee & Discount
            </h4>
            {defaultFee != null ? (
              <div className="mb-3 flex items-center justify-between gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                <span>
                  Default for {student.standard} · {variantValue}:{' '}
                  <strong>{formatMoney(defaultFee)}</strong>
                </span>
                <button
                  onClick={() => setTotalFee(String(defaultFee))}
                  className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className="mb-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 text-xs">
                No standard-wise default set for {student.standard} · {variantValue || '—'}.
                Add one under <strong>Fee Structure</strong>.
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Total Fee</label>
                <input type="number" min="0" value={totalFee} onChange={(e) => setTotalFee(e.target.value)} className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Discount</label>
                <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className={inputCls()} />
              </div>
            </div>
            <button
              onClick={handleSaveFee}
              disabled={savingFee}
              className="mt-3 w-full px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-600 text-white text-sm font-medium hover:bg-gray-900 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
            >
              {savingFee ? 'Saving…' : 'Save Fee'}
            </button>
          </section>

          {/* Record payment */}
          <section>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Record Payment
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</label>
                <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls()}>
                  {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Note</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="optional" className={inputCls()} />
              </div>
            </div>
            <button
              onClick={handleAddPayment}
              disabled={savingPayment}
              className="mt-3 w-full px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors"
            >
              {savingPayment ? 'Recording…' : 'Add Payment'}
            </button>
          </section>

          {/* Payment history */}
          <section>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Payment History ({payments.length})
            </h4>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No payments recorded yet</p>
            ) : (
              <ul className="space-y-2">
                {payments.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatMoney(p.amount)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(p.date)} · {p.method}
                        {p.note ? ` · ${p.note}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePayment(p._id)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Delete payment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/40 p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${accent ?? 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
    </div>
  )
}
