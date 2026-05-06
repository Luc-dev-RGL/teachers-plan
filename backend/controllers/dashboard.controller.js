import pool from '../config/db.js';
import { AnneeAcademiqueModel } from '../models/AnneeAcademique.js';

export const statistiques = async (req, res) => {
  try {
    const annee = await AnneeAcademiqueModel.getCurrent();
    if (!annee) {
      return res.json({
        success: true,
        data: {
          annee: null,
          statistiques: { nb_enseignants: 0, seances_ce_mois: 0, total_heures: 0, nb_salles: 0, heures_prevues: 0 },
          departements: [],
          seances_recentes: [],
        },
      });
    }

    const [nbEns, nbSalles, seancesMois, heuresRows, prevuesRows, depRows, recentsRows] = await Promise.all([
      pool.query("SELECT COUNT(*) as total FROM enseignants WHERE statut = 'actif'"),
      pool.query('SELECT COUNT(*) as total FROM salles'),
      pool.query(`SELECT COUNT(*) as total FROM seances_cours
        WHERE annee_academique_id = $1 AND to_char(CURRENT_DATE, 'YYYY-MM') = to_char(date_debut, 'YYYY-MM') AND statut != 'annulee'`, [annee.id]),
      pool.query(`SELECT COALESCE(SUM(he.nombre_heures * eq.coefficient), 0) as total
        FROM heures_effectuees he LEFT JOIN equivalences eq ON eq.id = he.equivalence_id WHERE he.annee_academique_id = $1`, [annee.id]),
      pool.query(`SELECT COALESCE(SUM(COALESCE(p.heures_cm,0) + COALESCE(p.heures_td,0) + COALESCE(p.heures_tp,0)), 0) as total_prevues
        FROM programmes p`, []),
      pool.query(`SELECT d.nom, d.code, COALESCE(SUM(he.nombre_heures * eq.coefficient), 0) as heures
        FROM departements d
        LEFT JOIN enseignants e ON e.departement_id = d.id
        LEFT JOIN heures_effectuees he ON he.enseignant_id = e.id AND he.annee_academique_id = $1
        LEFT JOIN equivalences eq ON eq.id = he.equivalence_id
        GROUP BY d.id, d.nom, d.code ORDER BY heures DESC`, [annee.id]),
      pool.query(`SELECT sc.date_debut, sc.type_seance, sc.statut,
          e.nom as enseignant_nom, e.prenom as enseignant_prenom,
          m.nom as matiere_nom, c.nom as classe_nom
        FROM seances_cours sc
        LEFT JOIN enseignants e ON e.id = sc.enseignant_id
        LEFT JOIN matieres m ON m.id = sc.matiere_id
        LEFT JOIN classes c ON c.id = sc.classe_id
        WHERE sc.annee_academique_id = $1
        ORDER BY sc.date_debut DESC LIMIT 10`, [annee.id]),
    ]);

    res.json({
      success: true,
      data: {
        annee,
        statistiques: {
          nb_enseignants: parseInt(nbEns.rows[0]?.total || 0),
          seances_ce_mois: parseInt(seancesMois.rows[0]?.total || 0),
          total_heures: parseFloat(heuresRows.rows[0]?.total || 0),
          nb_salles: parseInt(nbSalles.rows[0]?.total || 0),
          heures_prevues: parseFloat(prevuesRows.rows[0]?.total_prevues || 0),
        },
        departements: depRows.rows,
        seances_recentes: recentsRows.rows,
      },
    });
  } catch (erreur) {
    console.error('Erreur dashboard:', erreur);
    res.status(500).json({ success: false, message: erreur.message });
  }
};