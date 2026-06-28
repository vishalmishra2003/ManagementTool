import { Router } from 'express'
import { createStudentController } from '../controllers/studentController.js'

// Builds a router exposing the standard student + fees endpoints for a model.
export function buildStudentRouter(Model, variantField) {
  const c = createStudentController(Model, variantField)
  const router = Router()

  router.route('/').get(c.list).post(c.create)
  router.route('/:id').get(c.getOne).put(c.update).delete(c.remove)
  router.patch('/:id/fees', c.setFees)
  router.post('/:id/payments', c.addPayment)
  router.delete('/:id/payments/:paymentId', c.removePayment)

  return router
}
