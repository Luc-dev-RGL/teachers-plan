import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration du répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chargement des variables d'environnement
dotenv.config({ path: path.join(__dirname, '.env') });

// Import des middlewares
import { gestionnaireErreurs, routeNonTrouvee } from './middlewares/errorHandler.js';

// Import des routes
import authRoutes from './routes/auth.routes.js';
import utilisateurRoutes from './routes/utilisateur.routes.js';
import enseignantRoutes from './routes/enseignant.routes.js';
import departementRoutes from './routes/departement.routes.js';
import filiereRoutes from './routes/filiere.routes.js';
import niveauRoutes from './routes/niveau.routes.js';
import classeRoutes from './routes/classe.routes.js';
import salleRoutes from './routes/salle.routes.js';
import matiereRoutes from './routes/matiere.routes.js';
import seanceRoutes from './routes/seance.routes.js';
import heuresEffectueesRoutes from './routes/heures-effectuees.routes.js';
import equivalenceRoutes from './routes/equivalence.routes.js';
import tauxHoraireRoutes from './routes/taux-horaire.routes.js';
import anneeAcademiqueRoutes from './routes/annee-academique.routes.js';
import presenceRoutes from './routes/presence.routes.js';
import exportRoutes from './routes/export.routes.js';
import auditRoutes from './routes/audit.routes.js';
import parametresEtablissementRoutes from './routes/parametres-etablissement.routes.js';
import parametresAlertesRoutes from './routes/parametres-alertes.routes.js';
import parametresSemestresRoutes from './routes/parametres-semestres.routes.js';
import parametresNiveauxRoutes from './routes/parametres-niveaux.routes.js';
import reinitialisationMdpRoutes from './routes/reinitialisation-mdp.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import rechercheRoutes from './routes/recherche.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parseurs de corps de requête
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes publiques
app.use('/api/auth', authRoutes);
app.use('/api/reinitialisation-mdp', reinitialisationMdpRoutes);

// Routes protégées (nécessitent un token)
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/enseignants', enseignantRoutes);
app.use('/api/departements', departementRoutes);
app.use('/api/filieres', filiereRoutes);
app.use('/api/niveaux', niveauRoutes);
app.use('/api/classes', classeRoutes);
app.use('/api/salles', salleRoutes);
app.use('/api/matieres', matiereRoutes);
app.use('/api/seances', seanceRoutes);
app.use('/api/heures-effectuees', heuresEffectueesRoutes);
app.use('/api/equivalences', equivalenceRoutes);
app.use('/api/taux-horaire', tauxHoraireRoutes);
app.use('/api/annees-academiques', anneeAcademiqueRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/parametres/etablissement', parametresEtablissementRoutes);
app.use('/api/parametres/alertes', parametresAlertesRoutes);
app.use('/api/parametres/semestres', parametresSemestresRoutes);
app.use('/api/parametres/niveaux', parametresNiveauxRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recherche', rechercheRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    succes: true, 
    message: 'Serveur opérationnel',
    horodatage: new Date().toISOString()
  });
});

// Route 404 pour les routes non trouvées
app.use(routeNonTrouvee);

// Gestionnaire d'erreurs global
app.use(gestionnaireErreurs);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('');
  console.log('✅ ============================================');
  console.log(`✅ Serveur Teacher's Plan démarré sur le port ${PORT}`);
  console.log(`✅ Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ ============================================');
  console.log('');
  console.log('📡 Routes API disponibles:');
  console.log('   - POST   /api/auth/connexion');
  console.log('   - POST   /api/auth/inscription');
  console.log('   - GET    /api/enseignants');
  console.log('   - GET    /api/departements');
  console.log('   - GET    /api/dashboard/statistiques');
  console.log('   ... et plus encore');
  console.log('');
  console.log('🌐 URL locale: http://localhost:' + PORT);
  console.log('');
});
