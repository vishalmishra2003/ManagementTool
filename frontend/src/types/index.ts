export type Course = 'admission' | 'english'

export interface Payment {
  _id: string
  amount: number
  date: string
  method: string
  note: string
}

export interface Fees {
  totalFee: number
  discount: number
  payments: Payment[]
}

export interface FeeSummary {
  totalFee: number
  discount: number
  netFee: number
  paid: number
  balance: number
  status: 'paid' | 'partial' | 'unpaid'
}

interface BaseStudent {
  _id: string
  name: string
  dateOfJoining: string
  studentContact: string
  parentContact: string
  dateOfBirth: string
  fatherOccupation: string
  schoolName: string
  standard: string
  fees: Fees
  feeSummary: FeeSummary
  createdAt: string
  updatedAt: string
}

export interface AdmissionStudent extends BaseStudent {
  address: string
  board: string
  yearOfPassing: string
  percentageGrade: string
}

export interface EnglishStudent extends BaseStudent {
  batch: string
  currentStatus: string
}

export type Student = AdmissionStudent | EnglishStudent

export interface FeeStructure {
  _id: string
  course: Course
  standard: string
  variant: string
  amount: number
}
