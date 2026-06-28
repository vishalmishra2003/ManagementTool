import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

// POST /api/auth/login
// Single-admin login validated against env credentials. No signup endpoint exists.
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {}

  if (username !== env.admin.username || password !== env.admin.password) {
    throw new ApiError(401, 'Invalid username or password')
  }

  const token = jwt.sign({ sub: 'admin', username }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  })

  res.json({ token, user: { username } })
})

// GET /api/auth/me  (protected) — lets the client confirm a stored token is valid.
export const me = asyncHandler(async (req, res) => {
  res.json({ user: { username: req.user.username } })
})
