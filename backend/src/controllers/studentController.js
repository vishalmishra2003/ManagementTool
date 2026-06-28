import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

// Builds a set of CRUD + fees handlers for a given student model.
// `variantField` is the field used as the fee-structure key: 'board' or 'batch'.
export function createStudentController(Model, variantField) {
  // GET /  — list, optional ?standard= & ?<variantField>= filters
  const list = asyncHandler(async (req, res) => {
    const filter = {}
    if (req.query.standard) filter.standard = req.query.standard
    if (req.query[variantField]) filter[variantField] = req.query[variantField]

    const students = await Model.find(filter).sort({ createdAt: -1 })
    res.json(students)
  })

  // GET /:id  — single student incl. payment history
  const getOne = asyncHandler(async (req, res) => {
    const student = await Model.findById(req.params.id)
    if (!student) throw new ApiError(404, 'Student not found')
    res.json(student)
  })

  // POST /  — create a student (fees optional)
  const create = asyncHandler(async (req, res) => {
    const student = await Model.create(req.body)
    res.status(201).json(student)
  })

  // PUT /:id  — update demographic fields (fees handled by dedicated routes)
  const update = asyncHandler(async (req, res) => {
    const payload = { ...req.body }
    delete payload.fees // protect fees from accidental overwrite
    const student = await Model.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    })
    if (!student) throw new ApiError(404, 'Student not found')
    res.json(student)
  })

  // DELETE /:id
  const remove = asyncHandler(async (req, res) => {
    const student = await Model.findByIdAndDelete(req.params.id)
    if (!student) throw new ApiError(404, 'Student not found')
    res.json({ message: 'Student deleted' })
  })

  // PATCH /:id/fees  — set/replace total fee + discount
  const setFees = asyncHandler(async (req, res) => {
    const { totalFee, discount } = req.body || {}
    const student = await Model.findById(req.params.id)
    if (!student) throw new ApiError(404, 'Student not found')

    if (totalFee !== undefined) student.fees.totalFee = Number(totalFee)
    if (discount !== undefined) student.fees.discount = Number(discount)
    await student.save()
    res.json(student)
  })

  // POST /:id/payments  — record a payment (the "update when fees is paid" action)
  const addPayment = asyncHandler(async (req, res) => {
    const { amount, date, method, note } = req.body || {}
    if (amount === undefined || Number(amount) <= 0) {
      throw new ApiError(400, 'A positive payment amount is required')
    }
    const student = await Model.findById(req.params.id)
    if (!student) throw new ApiError(404, 'Student not found')

    student.fees.payments.push({
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      method: method || '',
      note: note || '',
    })
    await student.save()
    res.status(201).json(student)
  })

  // DELETE /:id/payments/:paymentId  — undo a recorded payment
  const removePayment = asyncHandler(async (req, res) => {
    const student = await Model.findById(req.params.id)
    if (!student) throw new ApiError(404, 'Student not found')

    const payment = student.fees.payments.id(req.params.paymentId)
    if (!payment) throw new ApiError(404, 'Payment not found')
    payment.deleteOne()
    await student.save()
    res.json(student)
  })

  return { list, getOne, create, update, remove, setFees, addPayment, removePayment }
}
