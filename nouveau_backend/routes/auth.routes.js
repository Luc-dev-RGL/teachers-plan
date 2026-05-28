import { Router } from 'express';
import { connecter, inscrire, obtenirProfil, modifierMotDePasse, deconnecter } from '../controllers/auth.controller.js';
import { verifierToken } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * Routes publiques
 */
// Connexion
router.post('/connexion', connecter);

// Inscription (réservée aux admin/rh via middleware dans une route séparée si nécessaire)
router.post('/inscription', inscrire);

/**
 * Routes protégées
 */
// Profil de l'utilisateur connecté
router.get('/profil', verifierToken, obtenirProfil);

// Modification du mot de passe
router.put('/mot-de-passe', verifierToken, modifierMotDePasse);

// Déconnexion
router.post('/deconnexion', verifierToken, deconnecter);

export default router;
