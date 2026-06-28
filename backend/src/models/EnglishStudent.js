import mongoose from 'mongoose'
import { feesSchema, feeSummary } from './feesSchema.js'

const { Schema } = mongoose

const englishStudentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    dateOfJoining: { type: String, required: true },
    standard: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, required: true },
    studentContact: { type: String, required: true, trim: true },
    parentContact: { type: String, trim: true, default: '' },
    fatherOccupation: { type: String, trim: true, default: '' },
    schoolName: { type: String, trim: true, default: '' },
    currentStatus: { type: String, trim: true, default: '' },
    fees: { type: feesSchema, default: () => ({}) },
  },
  { timestamps: true },
)

englishStudentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.feeSummary = feeSummary(ret.fees)
    return ret
  },
})

export const EnglishStudent = mongoose.model('EnglishStudent', englishStudentSchema)
