import mongoose from 'mongoose'

const { Schema } = mongoose

// Standard-wise default fee. Keyed by course + standard + variant, where
// "variant" is the board (admission) or batch (english) — see Fee scope.
const feeStructureSchema = new Schema(
  {
    course: { type: String, required: true, enum: ['admission', 'english'] },
    standard: { type: String, required: true, trim: true },
    variant: { type: String, required: true, trim: true }, // board or batch
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
)

feeStructureSchema.index({ course: 1, standard: 1, variant: 1 }, { unique: true })

feeStructureSchema.set('toJSON', { virtuals: true, versionKey: false })

export const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema)
