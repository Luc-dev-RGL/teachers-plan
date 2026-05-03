import { Router } from 'express';
import { getAll, getCurrent, getById, create, update, remove } from '../controllers/annee-academique.controller.js';
import { verifierToken, verifierRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifierToken);

router.get('/', getAll);
router.get('/en-cours', getCurrent);
router.get('/:id', getById);
router.post('/', verifierRole('admin'), create);
router.put('/:id', verifierRole('admin'), update);
router.delete('/:id', verifierRole('admin'), remove);

export default router;