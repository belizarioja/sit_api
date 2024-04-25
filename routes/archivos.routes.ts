import { Router } from 'express';
import { exportFacturas, getFactura, getUtils, redistribuir } from '../controllers/archivos.controller';

const router = Router();

router.route('/:rif/:anniomes/:rifid').get(getFactura)
router.route('/exportarlote').post(exportFacturas)
router.route('/redistribuir').post(redistribuir)
router.route('/utils/:img').get(getUtils)

export default router;