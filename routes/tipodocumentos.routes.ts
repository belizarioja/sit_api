import { Router } from 'express';
import { getTipoDocumento, getTipoCedula } from '../controllers/tipodocumentos.controller';

const router = Router();

router.route('/')
    .get(getTipoDocumento)
router.route('/tipocedula')
        .get(getTipoCedula)

export default router;