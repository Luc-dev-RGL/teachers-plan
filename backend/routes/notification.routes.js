import { Router } from 'express';
import { verifierToken, verifierRole } from '../middlewares/auth.middleware.js';
import { getAll, getById, create, update, remove, getNonLues } from '../controllers/notification.controller.js';

const router = Router();

router.use(verifierToken);

// GET /api/notifications — Toutes (admin, rh, enseignant voient les leurs)
router.get('/', verifierRole(['admin', 'rh', 'enseignant']), getAll);

// GET /api/notifications/non-lues — Nombre non lues
router.get('/non-lues', verifierRole(['admin', 'rh', 'enseignant']), getNonLues);

// GET /api/notifications/:id — Une seule
router.get('/:id', verifierRole(['admin', 'rh', 'enseignant']), getById);

// POST /api/notifications — Créer (admin, rh)
router.post('/', verifierRole(['admin', 'rh']), create);

// PUT /api/notifications/:id — Marquer comme lue
router.put('/:id', verifierRole(['admin', 'rh', 'enseignant']), update);

// DELETE /api/notifications/:id — Supprimer (admin uniquement)
router.delete('/:id', verifierRole(['admin']), remove);

export default router;