import { Router } from 'express';
import { getAll } from '../controllers/notification.controller.js';
import { verifierToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifierToken);

router.get('/', getAll);

export default router;