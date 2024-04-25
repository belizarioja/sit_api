import { Router } from 'express';
import { setAnulacion } from '../controllers/anulacion.controller';
import { verifyTokenFactura } from '../lib/verifyTokenFactura'


const router = Router();

router.route('/').post(verifyTokenFactura, setAnulacion)

export default router;