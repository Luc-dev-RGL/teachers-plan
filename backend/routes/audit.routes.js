import { Router } from 'express';
import { getAll } from '../controllers/audit.controller.js';
import { verifierToken, verifierRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifierToken);
router.use(verifierRole('admin'));

router.get('/', getAll);

export default router;