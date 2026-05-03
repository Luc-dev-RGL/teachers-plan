import { Router } from 'express';
import { demander, verifier } from '../controllers/reinitialisation-mdp.controller.js';

const router = Router();

router.post('/demander', demander);
router.post('/verifier', verifier);

export default router;