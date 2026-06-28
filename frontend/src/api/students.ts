import { apiFetch } from './client'
import type { Course, Student } from '../types'

export interface StudentFilter {
  standard?: string
  board?: string
  batch?: string
}

function query(filter: StudentFilter): string {
  const params = new URLSearchParams()
  if (filter.standard) params.set('standard', filter.standard)
  if (filter.board) params.set('board', filter.board)
  if (filter.batch) params.set('batch', filter.batch)
  const s = params.toString()
  return s ? `?${s}` : ''
}

export function listStudents(course: Course, filter: StudentFilter = {}) {
  return apiFetch<Student[]>(`/${course}${query(filter)}`)
}

export function getStudent(course: Course, id: string) {
  return apiFetch<Student>(`/${course}/${id}`)
}

export function createStudent(course: Course, data: Record<string, unknown>) {
  return apiFetch<Student>(`/${course}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateStudent(course: Course, id: string, data: Record<string, unknown>) {
  return apiFetch<Student>(`/${course}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteStudent(course: Course, id: string) {
  return apiFetch<{ message: string }>(`/${course}/${id}`, { method: 'DELETE' })
}

export function setFees(course: Course, id: string, totalFee: number, discount: number) {
  return apiFetch<Student>(`/${course}/${id}/fees`, {
    method: 'PATCH',
    body: JSON.stringify({ totalFee, discount }),
  })
}

export interface NewPayment {
  amount: number
  date?: string
  method?: string
  note?: string
}

export function addPayment(course: Course, id: string, payment: NewPayment) {
  return apiFetch<Student>(`/${course}/${id}/payments`, {
    method: 'POST',
    body: JSON.stringify(payment),
  })
}

export function deletePayment(course: Course, id: string, paymentId: string) {
  return apiFetch<Student>(`/${course}/${id}/payments/${paymentId}`, {
    method: 'DELETE',
  })
}
