import { Router } from 'express'
import {
  listFeeStructures,
  upsertFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} from '../controllers/feeStructureController.js'

const router = Router()

router.route('/').get(listFeeStructures).post(upsertFeeStructure)
router.route('/:id').put(updateFeeStructure).delete(deleteFeeStructure)

export default router
