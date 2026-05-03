import { Router } from 'express';
import { get, update } from '../controllers/parametres-etablissement.controller.js';
import { verifierToken, verifierRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifierToken);

router.get('/', get);
router.put('/', verifierRole('admin'), update);

export default router;