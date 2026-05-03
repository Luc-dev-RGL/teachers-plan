import pool from '../config/db.js';
import AnneeAcademique from '../models/AnneeAcademique.js';

export const statistiques = async (req, res) => {
  try {
    const annee = await AnneeAcademique.trouverActive();
    if (!annee) {
      return res.json({ succes: true, statistiques: {}, departements: [], seances_recentes: [] });
    }

    const nbEnseignants = await pool.query(`SELECT COUNT(*) as total FROM enseignants WHERE statut = 'actif'`);
    const seancesMois = await pool.query(`
      SELECT COUNT(*) as total FROM seances_cours
      WHERE annee_academique_id = $1 AND to_char(CURRENT_DATE, 'YYYY-MM') = to_char(date, 'YYYY-MM') AND statut != 'annulee'
    `, [annee.id]);
    const heuresTotal = await pool.query(`
      SELECT COALESCE(SUM(heures_equiv_td), 0) as total FROM heures_effectuees WHERE annee_academique_id = $1
    `, [annee.id]);
    const nbSalles = await pool.query(`SELECT COUNT(*) as total FROM salles`);

    const parDept = await pool.query(`
      SELECT d.nom, d.code, COALESCE(SUM(he.heures_equiv_td), 0) as heures
      FROM departements d
      LEFT JOIN enseignants e ON e.departement_id = d.id
      LEFT JOIN heures_effectuees he ON he.enseignant_id = e.id AND he.annee_academique_id = $1
      GROUP BY d.id, d.nom, d.code ORDER BY heures DESC
    `, [annee.id]);

    const recentes = await pool.query(`
      SELECT s.date, s.heure_debut, s.heure_fin, s.type_seance, s.statut,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             m.nom as matiere_nom, c.nom as classe_nom
      FROM seances_cours s
      JOIN enseignants e ON e.id = s.enseignant_id
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      JOIN matieres m ON m.id = s.matiere_id
      JOIN classes c ON c.id = s.classe_id
      WHERE s.annee_academique_id = $1
      ORDER BY s.date DESC, s.heure_debut DESC LIMIT 10
    `, [annee.id]);

    res.json({
      succes: true,
      annee,
      statistiques: {
        nb_enseignants: parseInt(nbEnseignants.rows[0].total),
        seances_ce_mois: parseInt(seancesMois.rows[0].total),
        total_heures: parseFloat(heuresTotal.rows[0].total),
        nb_salles: parseInt(nbSalles.rows[0].total),
      },
      departements: parDept.rows,
      seances_recentes: recentes.rows,
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};