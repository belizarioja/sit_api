import { Router } from 'express';
import { getUsuarios, setUsuarios, getLogin, getRoles, updateEstatus, updateClave, updateEmail, updateHora, recoverLogin } from '../controllers/usuarios.controller';

const router = Router();

router.route('/').get(getUsuarios)
router.route('/').post(setUsuarios)
router.route('/login').post(getLogin)
router.route('/roles').get(getRoles)
router.route('/estatus/:id').put(updateEstatus)
router.route('/cambioclave/:id').put(updateClave)
router.route('/cambioemail/:id').put(updateEmail)
router.route('/cambiohora/:id').put(updateHora)
router.route('/recuperarclave').post(recoverLogin)
        
export default router;