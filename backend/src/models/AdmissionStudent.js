import mongoose from 'mongoose'
import { feesSchema, feeSummary } from './feesSchema.js'

const { Schema } = mongoose

const admissionStudentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    dateOfJoining: { type: String, required: true },
    studentContact: { type: String, required: true, trim: true },
    parentContact: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    standard: { type: String, required: true, trim: true },
    board: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, required: true },
    fatherOccupation: { type: String, trim: true, default: '' },
    yearOfPassing: { type: String, trim: true, default: '' },
    percentageGrade: { type: String, trim: true, default: '' },
    schoolName: { type: String, required: true, trim: true },
    fees: { type: feesSchema, default: () => ({}) },
  },
  { timestamps: true },
)

admissionStudentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.feeSummary = feeSummary(ret.fees)
    return ret
  },
})

export const AdmissionStudent = mongoose.model('AdmissionStudent', admissionStudentSchema)
