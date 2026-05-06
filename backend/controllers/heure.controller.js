import { query } from '../config/db.js';

export const lister = async (req, res) => {
  try {
    const filtres = { ...req.query };

    if (req.utilisateur.role === 'enseignant') {
      filtres.enseignant_id = req.utilisateur.enseignant_id;
    }

    let sql = `
      SELECT he.*, e.nom as enseignant_nom, e.prenom as enseignant_prenom,
             e.matricule, eq.type_heure, eq.coefficient,
             (he.nombre_heures * eq.coefficient) as heures_equivalentes,
             aa.libelle as annee_academique
      FROM heures_effectuees he
      LEFT JOIN enseignants e ON he.enseignant_id = e.id
      LEFT JOIN equivalences eq ON he.equivalence_id = eq.id
      LEFT JOIN annees_academiques aa ON he.annee_academique_id = aa.id
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (filtres.enseignant_id) { sql += ` AND he.enseignant_id = $${idx++}`; params.push(filtres.enseignant_id); }
    if (filtres.annee_academique_id) { sql += ` AND he.annee_academique_id = $${idx++}`; params.push(filtres.annee_academique_id); }
    if (filtres.mois) { sql += ` AND he.mois = $${idx++}`; params.push(filtres.mois); }
    if (filtres.validee !== undefined) { sql += ` AND he.validee = $${idx++}`; params.push(filtres.validee === 'true'); }

    sql += ' ORDER BY he.mois ASC, e.nom ASC';
    const { rows: donnees } = await query(sql, params);

    // Totaux
    let sqlT = `
      SELECT COUNT(*) as nb,
             COALESCE(SUM(he.nombre_heures), 0) as total_reelles,
             COALESCE(SUM(he.nombre_heures * eq.coefficient), 0) as total_equiv
      FROM heures_effectuees he
      LEFT JOIN equivalences eq ON eq.id = he.equivalence_id
      WHERE 1=1`;
    const paramsT = [];
    let iT = 1;
    if (filtres.enseignant_id) { sqlT += ` AND he.enseignant_id = $${iT++}`; paramsT.push(filtres.enseignant_id); }
    if (filtres.annee_academique_id) { sqlT += ` AND he.annee_academique_id = $${iT++}`; paramsT.push(filtres.annee_academique_id); }
    const { rows: [totaux] } = await query(sqlT, paramsT);

    res.json({
      success: true,
      data: donnees,
      totaux: {
        nb_enregistrements: parseInt(totaux.nb || 0),
        total_reelles: parseFloat(totaux.total_reelles || 0),
        total_equiv: parseFloat(totaux.total_equiv || 0),
        nb_enseignants: new Set(donnees.map(d => d.enseignant_id)).size,
      },
    });
  } catch (erreur) {
    res.status(500).json({ success: false, message: erreur.message });
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

    const { rows } = await query(`
      SELECT e.id, e.matricule, e.nom, e.prenom, e.grade, e.categorie,
             d.nom as departement_nom,
             SUM(he.nombre_heures) as total_reelles,
             SUM(he.nombre_heures * eq.coefficient) as total_equiv,
             COUNT(he.id) as nb_seances
      FROM heures_effectuees he
      JOIN enseignants e ON e.id = he.enseignant_id
      LEFT JOIN departements d ON d.id = e.departement_id
      LEFT JOIN equivalences eq ON eq.id = he.equivalence_id
      ${where}
      GROUP BY e.id, e.matricule, e.nom, e.prenom, e.grade, e.categorie, d.nom
      ORDER BY d.nom, e.nom
    `, params);

    res.json({ success: true, data: rows });
  } catch (erreur) {
    res.status(500).json({ success: false, message: erreur.message });
  }
};

export const valider = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'Liste d\'IDs requise' });
    }
    const { rows } = await query(
      `UPDATE heures_effectuees
       SET validee = true, valide_par = $1, date_validation = CURRENT_TIMESTAMP
       WHERE id = ANY($2) AND validee = false
       RETURNING *`,
      [req.utilisateur.id, ids]
    );
    res.json({ success: true, data: rows, message: `${rows.length} heure(s) validée(s)` });
  } catch (erreur) {
    res.status(500).json({ success: false, message: erreur.message });
  }
};

export const rejeter = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'Liste d\'IDs requise' });
    }
    const { rows } = await query(
      `UPDATE heures_effectuees SET validee = false WHERE id = ANY($2) AND validee = true RETURNING *`,
      [req.utilisateur.id, ids]
    );
    res.json({ success: true, data: rows, message: `${rows.length} heure(s) rejetée(s)` });
  } catch (erreur) {
    res.status(500).json({ success: false, message: erreur.message });
  }
};