import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/presence.controller.js';
import { verifierToken, verifierRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifierToken);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', verifierRole('admin'), remove);

export default router;