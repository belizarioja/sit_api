import { Router } from 'express';
import { setBitacora, getBitacora, getEventos } from '../controllers/bitacoras.controller';

const router = Router();

router.route('/')
    .post(setBitacora)
    
router.route('/listar')
.post(getBitacora)

router.route('/eventos')
    .get(getEventos)

export default router;