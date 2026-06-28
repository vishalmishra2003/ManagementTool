import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return next(new ApiError(401, 'Authentication required'))

  try {
    req.user = jwt.verify(token, env.jwt.secret)
    next()
  } catch {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}
