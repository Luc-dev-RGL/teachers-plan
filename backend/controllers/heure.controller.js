import HeureEffectuee from '../models/HeureEffectuee.js';

export const lister = async (req, res) => {
  try {
    const filtres = { ...req.query };

    if (req.utilisateur.role === 'enseignant') {
      filtres.enseignant_id = req.utilisateur.enseignant_id;
    }

    const donnees = await HeureEffectuee.lister(filtres);
    const totaux = await HeureEffectuee.totalHeures(filtres);

    res.json({
      succes: true,
      donnees,
      totaux: {
        total_reelles: parseFloat(totaux.total_reelles || 0),
        total_equiv_td: parseFloat(totaux.total_equiv_td || 0),
        total_montant: parseFloat(totaux.total_montant || 0),
        nb_enseignants: parseInt(totaux.nb_enseignants || 0),
      },
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const resumeParEnseignant = async (req, res) => {
  try {
    const { annee_academique_id, departement_id } = req.query;

    let conditions = [];
    const params = [];
    let index = 1;

    if (annee_academique_id) { conditions.push(`he.annee_academique_id = $${index++}`); params.push(annee_academique_id); }
    if (departement_id) { conditions.push(`e.departement_id = $${index++}`); params.push(departement_id); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const { default: pool } = await import('../config/db.js');

    const resultat = await pool.query(`
      SELECT e.id, e.matricule, u.nom, u.prenom, e.categorie,
             d.nom as departement_nom,
             SUM(he.heures_reelles) as total_reelles,
             SUM(he.heures_equiv_td) as total_equiv_td,
             SUM(he.montant_calcule) as total_montant,
             COUNT(he.id) as nb_seances
      FROM heures_effectuees he
      JOIN enseignants e ON e.id = he.enseignant_id
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      LEFT JOIN departements d ON d.id = e.departement_id
      ${where}
      GROUP BY e.id, e.matricule, u.nom, u.prenom, e.categorie, d.nom
      ORDER BY d.nom, u.nom
    `, params);

    res.json({ succes: true, donnees: resultat.rows });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};