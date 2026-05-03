import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/parametres-alertes.controller.js';
import { verifierToken, verifierRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifierToken);

router.get('/', getAll);
router.post('/', verifierRole('admin'), create);
router.put('/:id', verifierRole('admin'), update);
router.delete('/:id', verifierRole('admin'), remove);

export default router;