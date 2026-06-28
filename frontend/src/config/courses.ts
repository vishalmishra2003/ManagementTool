import type { Course } from '../types'

export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'date' | 'tel' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: string[]
  fullWidth?: boolean
  today?: boolean // default date inputs to today
}

export interface ColumnConfig {
  key: string
  label: string
  badge?: boolean
}

export interface CourseConfig {
  course: Course
  title: string
  variantField: 'board' | 'batch'
  variantOptions: string[]
  fields: FieldConfig[]
  columns: ColumnConfig[]
}

export const admissionConfig: CourseConfig = {
  course: 'admission',
  title: 'Admission Form',
  variantField: 'board',
  variantOptions: ['State', 'ICSE', 'CBSE', 'Science', 'Commerce'],
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Student full name' },
    { key: 'dateOfJoining', label: 'Date of Joining', type: 'date', required: true, today: true },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { key: 'standard', label: 'Standard', type: 'text', required: true, placeholder: 'e.g. 10th, 12th' },
    { key: 'board', label: 'Board / Stream', type: 'select', required: true, options: ['State', 'ICSE', 'CBSE', 'Science', 'Commerce'] },
    { key: 'studentContact', label: 'Student Contact', type: 'tel', required: true, placeholder: '10-digit mobile number' },
    { key: 'parentContact', label: 'Parent Contact', type: 'tel', placeholder: '10-digit mobile number' },
    { key: 'fatherOccupation', label: "Father's Occupation", type: 'text', placeholder: 'e.g. Business, Service' },
    { key: 'schoolName', label: 'School Name', type: 'text', required: true, placeholder: 'Name of school' },
    { key: 'yearOfPassing', label: 'Year of Passing', type: 'text', placeholder: 'e.g. 2024' },
    { key: 'percentageGrade', label: 'Percentage / Grade in Last Exam', type: 'text', placeholder: 'e.g. 85% or A+' },
    { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Full residential address', fullWidth: true },
  ],
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'standard', label: 'Standard' },
    { key: 'board', label: 'Board', badge: true },
    { key: 'dateOfJoining', label: 'Date of Joining' },
    { key: 'studentContact', label: 'Student Contact' },
    { key: 'parentContact', label: 'Parent Contact' },
    { key: 'schoolName', label: 'School' },
  ],
}

export const englishConfig: CourseConfig = {
  course: 'english',
  title: 'English Speaking Form',
  variantField: 'batch',
  variantOptions: ['Basic', 'Advance', 'Business', 'Personality Development'],
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Student full name' },
    { key: 'dateOfJoining', label: 'Date of Joining', type: 'date', required: true, today: true },
    { key: 'standard', label: 'Standard', type: 'text', required: true, placeholder: 'e.g. 10th, Graduate' },
    { key: 'batch', label: 'Batch', type: 'select', required: true, options: ['Basic', 'Advance', 'Business', 'Personality Development'] },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { key: 'studentContact', label: 'Student Contact', type: 'tel', required: true, placeholder: '10-digit mobile number' },
    { key: 'parentContact', label: 'Parent Contact', type: 'tel', placeholder: '10-digit mobile number' },
    { key: 'fatherOccupation', label: "Father's Occupation", type: 'text', placeholder: 'e.g. Business, Service' },
    { key: 'schoolName', label: 'Name of School', type: 'text', placeholder: 'School or college name' },
    { key: 'currentStatus', label: 'Current Status', type: 'text', placeholder: 'e.g. Student, Working Professional' },
  ],
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'dateOfJoining', label: 'Date of Joining' },
    { key: 'standard', label: 'Standard' },
    { key: 'batch', label: 'Batch', badge: true },
    { key: 'studentContact', label: 'Student Contact' },
    { key: 'parentContact', label: 'Parent Contact' },
    { key: 'currentStatus', label: 'Current Status' },
  ],
}
