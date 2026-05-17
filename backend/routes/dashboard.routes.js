import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    // Statistiques
    const enseignantsResult = await query("SELECT COUNT(*) as total FROM enseignants WHERE statut = 'actif'");
    const sallesResult = await query('SELECT COUNT(*) as total FROM salles');
    const seancesResult = await query('SELECT COUNT(*) as total FROM seances_cours');
    const heuresResult = await query('SELECT COALESCE(SUM(nombre_heures), 0) as total FROM heures_effectuees');

    const nbEnseignants = parseInt(enseignantsResult.rows[0]?.total || 0);
    const nbSalles = parseInt(sallesResult.rows[0]?.total || 0);
    const seancesCeMois = parseInt(seancesResult.rows[0]?.total || 0);
    const totalHeures = parseFloat(heuresResult.rows[0]?.total || 0);

    // Heures par département
    const depResult = await query(
      `SELECT d.id, d.code, d.nom, COALESCE(SUM(he.nombre_heures), 0) as heures
       FROM departements d
       LEFT JOIN enseignants e ON e.departement_id = d.id
       LEFT JOIN heures_effectuees he ON he.enseignant_id = e.id
       GROUP BY d.id, d.code, d.nom
       ORDER BY heures DESC`
    );

    // Séances récentes
    const recentsResult = await query(
      `SELECT sc.id, sc.type_seance, sc.statut, sc.date, sc.heure_debut,
              e.nom as enseignant_nom, e.prenom as enseignant_prenom,
              m.nom as matiere_nom,
              c.nom as classe_nom
       FROM seances_cours sc
       LEFT JOIN enseignants e ON sc.enseignant_id = e.id
       LEFT JOIN matieres m ON sc.matiere_id = m.id
       LEFT JOIN classes c ON sc.classe_id = c.id
       ORDER BY sc.date DESC, sc.heure_debut DESC
       LIMIT 5`
    );

    res.json({
      succes: true,
      statistiques: {
        nb_enseignants: nbEnseignants,
        nb_salles: nbSalles,
        seances_ce_mois: seancesCeMois,
        total_heures: totalHeures,
        heures_prevues: 0,
      },
      departements: depResult.rows,
      seances_recentes: recentsResult.rows,
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ succes: false, message: error.message });
  }
});

export default router;