import { apiFetch } from './client'
import type { Course, FeeStructure } from '../types'

export function listFeeStructures(course?: Course) {
  const q = course ? `?course=${course}` : ''
  return apiFetch<FeeStructure[]>(`/fee-structures${q}`)
}

export function upsertFeeStructure(data: {
  course: Course
  standard: string
  variant: string
  amount: number
}) {
  return apiFetch<FeeStructure>('/fee-structures', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteFeeStructure(id: string) {
  return apiFetch<{ message: string }>(`/fee-structures/${id}`, { method: 'DELETE' })
}

// --- LocalStorage cache -----------------------------------------------------
// Fee structures change rarely, so we cache them per-course in localStorage.
// The Fee Structure page is the source of truth that refreshes the cache;
// other screens (e.g. FeesPanel) read cache-first and only hit the API on a miss.

const CACHE_KEY = 'feeStructures:v1'
type CacheShape = Partial<Record<Course, FeeStructure[]>>

function readCache(): CacheShape {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CacheShape) : {}
  } catch {
    return {}
  }
}

export function readFeeStructuresCache(course: Course): FeeStructure[] | null {
  return readCache()[course] ?? null
}

function writeFeeStructuresCache(course: Course, data: FeeStructure[]) {
  try {
    const cache = readCache()
    cache[course] = data
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // ignore quota / serialization errors — cache is best-effort
  }
}

export function invalidateFeeStructuresCache(course?: Course) {
  try {
    if (!course) {
      localStorage.removeItem(CACHE_KEY)
      return
    }
    const cache = readCache()
    delete cache[course]
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // ignore
  }
}

// Fetches fresh from the DB and updates the cache. Use from the management page.
export async function refreshFeeStructures(course: Course): Promise<FeeStructure[]> {
  const data = await listFeeStructures(course)
  writeFeeStructuresCache(course, data)
  return data
}

// Cache-first read: returns cached data if present, otherwise fetches + caches.
export async function getFeeStructures(course: Course): Promise<FeeStructure[]> {
  const cached = readFeeStructuresCache(course)
  if (cached) return cached
  return refreshFeeStructures(course)
}
