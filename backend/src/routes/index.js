import { Router } from 'express'
import authRoutes from './authRoutes.js'
import feeStructureRoutes from './feeStructureRoutes.js'
import { buildStudentRouter } from './studentRoutes.js'
import { AdmissionStudent } from '../models/AdmissionStudent.js'
import { EnglishStudent } from '../models/EnglishStudent.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use('/auth', authRoutes)

// Everything below requires a valid JWT.
router.use('/admission', requireAuth, buildStudentRouter(AdmissionStudent, 'board'))
router.use('/english', requireAuth, buildStudentRouter(EnglishStudent, 'batch'))
router.use('/fee-structures', requireAuth, feeStructureRoutes)

export default router
