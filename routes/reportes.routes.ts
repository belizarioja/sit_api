import { Router } from 'express';
import { getFacturas, getImpProcesados, getTopClientes, getTotalClientes, getFacturaNum, getFacturaDet, getAnulados, getGrafica, getDocProcesados, getUltimaSemana, getTotalSemanasTodos, getAnual } from '../controllers/reportes.controller';

const router = Router();

router.route('/facturas/relacionado').post(getFacturaNum)
router.route('/facturas/detalles/:id').get(getFacturaDet)
router.route('/facturas').post(getFacturas)
router.route('/impprocesados').post(getImpProcesados)
router.route('/anulados').post(getAnulados)
router.route('/topclientes').post(getTopClientes)
router.route('/totalclientes').post(getTotalClientes)
router.route('/grafica').post(getGrafica)
router.route('/anual').post(getAnual)
router.route('/totaldocumentos').post(getDocProcesados)
router.route('/ultimasemana').post(getUltimaSemana)
router.route('/totalsemanastodos').post(getTotalSemanasTodos)

export default router;