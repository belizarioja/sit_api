import { Router } from 'express';
import { setFacturacion, getNumerointerno } from '../controllers/facturacion.controller';
import { verifyTokenFactura } from '../lib/verifyTokenFactura'


const router = Router();

router.route('/').post(verifyTokenFactura, setFacturacion)
router.route('/numerointerno').post(verifyTokenFactura, getNumerointerno)


export default router;