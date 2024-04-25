import { Router } from 'express';
import { sendFacturaEmail } from '../controllers/email.controller';


const router = Router();

router.route('/').post(sendFacturaEmail)

export default router;