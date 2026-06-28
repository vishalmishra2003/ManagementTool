import { useCallback, useEffect, useState } from 'react'
import type { Course, Student } from '../types'
import { listStudents, type StudentFilter } from '../api/students'

export function useStudents(course: Course, filter: StudentFilter = {}) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Serialise the filter so the callback identity only changes on real changes.
  const filterKey = JSON.stringify(filter)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listStudents(course, JSON.parse(filterKey))
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [course, filterKey])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { students, loading, error, refresh, setStudents }
}
