import { Router } from 'express';
import { login, getMe, changePassword } from '../controllers/auth.controller.js';
import { verifierToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', verifierToken, getMe);
router.put('/change-password', verifierToken, changePassword);

export default router;