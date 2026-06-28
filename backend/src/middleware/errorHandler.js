import { ApiError } from '../utils/ApiError.js'

export function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found' })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err instanceof ApiError ? err.statusCode : 500
  let message = err.message || 'Internal server error'

  // Mongoose validation / cast errors -> 400
  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  } else if (err.name === 'CastError') {
    status = 400
    message = `Invalid ${err.path}: ${err.value}`
  } else if (err.code === 11000) {
    status = 409
    message = 'A record with these details already exists'
  }

  if (status === 500) console.error(err)
  res.status(status).json({ message })
}
