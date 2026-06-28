import { FeeStructure } from '../models/FeeStructure.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

// GET /api/fee-structures?course=admission|english
export const listFeeStructures = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.course) filter.course = req.query.course
  const structures = await FeeStructure.find(filter).sort({ course: 1, standard: 1, variant: 1 })
  res.json(structures)
})

// POST /api/fee-structures  — create or upsert a standard-wise default fee
export const upsertFeeStructure = asyncHandler(async (req, res) => {
  const { course, standard, variant, amount } = req.body || {}
  if (!course || !standard || !variant || amount === undefined) {
    throw new ApiError(400, 'course, standard, variant and amount are required')
  }
  const structure = await FeeStructure.findOneAndUpdate(
    { course, standard: standard.trim(), variant: variant.trim() },
    { amount: Number(amount) },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  res.status(201).json(structure)
})

// PUT /api/fee-structures/:id
export const updateFeeStructure = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!structure) throw new ApiError(404, 'Fee structure not found')
  res.json(structure)
})

// DELETE /api/fee-structures/:id
export const deleteFeeStructure = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.findByIdAndDelete(req.params.id)
  if (!structure) throw new ApiError(404, 'Fee structure not found')
  res.json({ message: 'Fee structure deleted' })
})
