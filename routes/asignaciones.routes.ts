import { Router } from 'express';
import { setAsignacion, getAsignacion, updFechaProd } from '../controllers/asignaciones.controller';
import { verifyTokenFactura } from '../lib/verifyTokenFactura'


const router = Router();

router.route('/').post(verifyTokenFactura, setAsignacion)
router.route('/listar').post(getAsignacion)
router.route('/:id').put(updFechaProd)

export default router;