import { Router } from 'express';
import { exportHeuresExcel, exportHeuresPdf } from '../controllers/export.controller.js';
import { verifierToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifierToken);

router.get('/heures/excel', exportHeuresExcel);
router.get('/heures/pdf', exportHeuresPdf);

export default router;