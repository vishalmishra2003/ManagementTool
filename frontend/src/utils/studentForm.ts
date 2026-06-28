import type { CourseConfig } from '../config/courses'
import type { Student } from '../types'

export type FormState = Record<string, string>

export function emptyForm(config: CourseConfig): FormState {
  const form: FormState = {}
  for (const f of config.fields) {
    form[f.key] = f.today ? new Date().toISOString().split('T')[0] : ''
  }
  return form
}

export function formFromStudent(config: CourseConfig, student: Student): FormState {
  const rec = student as unknown as Record<string, unknown>
  const form: FormState = {}
  for (const f of config.fields) {
    const value = rec[f.key]
    // date inputs need YYYY-MM-DD
    form[f.key] = value == null ? '' : String(value)
  }
  return form
}

export function validateForm(config: CourseConfig, form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const f of config.fields) {
    if (f.required && !form[f.key].trim()) errors[f.key] = 'This field is required'
  }
  return errors
}
