import { Router } from 'express';
import { 
  obtenirTous, 
  obtenirParId, 
  creer, 
  modifier, 
  supprimer 
} from '../controllers/enseignant.controller.js';
import { verifierToken, verifierRole } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * Toutes les routes nécessitent un token valide
 */
router.use(verifierToken);

// GET /api/enseignants - Récupérer tous les enseignants
router.get('/', obtenirTous);

// GET /api/enseignants/:id - Récupérer un enseignant par ID
router.get('/:id', obtenirParId);

// POST /api/enseignants - Créer un nouvel enseignant (admin/rh seulement)
router.post('/', verifierRole('admin', 'rh'), creer);

// PUT /api/enseignants/:id - Modifier un enseignant (admin/rh seulement)
router.put('/:id', verifierRole('admin', 'rh'), modifier);

// DELETE /api/enseignants/:id - Supprimer un enseignant (admin seulement)
router.delete('/:id', verifierRole('admin'), supprimer);

export default router;
