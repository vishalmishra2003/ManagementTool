import mongoose from 'mongoose'

const { Schema } = mongoose

// A single payment the admin records against a student.
const paymentSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    method: { type: String, trim: true, default: '' }, // cash / upi / card etc.
    note: { type: String, trim: true, default: '' },
  },
  { _id: true },
)

// Embedded fees object on every student.
// netFee   = totalFee - discount
// paid     = sum(payments.amount)
// balance  = netFee - paid
export const feesSchema = new Schema(
  {
    totalFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    payments: { type: [paymentSchema], default: [] },
  },
  { _id: false },
)

// Virtuals are attached on the parent models (where toJSON is configured),
// but we expose helpers here so controllers can compute consistently.
export function feeSummary(fees) {
  const totalFee = fees?.totalFee || 0
  const discount = fees?.discount || 0
  const netFee = Math.max(totalFee - discount, 0)
  const paid = (fees?.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
  const balance = netFee - paid
  let status = 'unpaid'
  if (netFee === 0) status = 'unpaid'
  else if (paid >= netFee) status = 'paid'
  else if (paid > 0) status = 'partial'
  return { totalFee, discount, netFee, paid, balance, status }
}
