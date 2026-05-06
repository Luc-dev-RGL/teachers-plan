import { query } from '../config/db.js';

export const TauxHoraireModel = {
  findAll: async () => {
    const { rows } = await query('SELECT * FROM taux_horaires ORDER BY categorie, grade');
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM taux_horaires WHERE id = $1', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO taux_horaires (grade, categorie, montant, devise, annee_academique_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.grade, data.categorie, data.montant, data.devise || 'FCFA', data.annee_academique_id]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['grade', 'categorie', 'montant', 'devise', 'annee_academique_id'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE taux_horaires SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM taux_horaires WHERE id = $1', [id]);
    return rowCount > 0;
  },
  calculerMontant: async (enseignantId, anneeId) => {
    const { rows } = await query(
      `SELECT e.categorie,
              COALESCE(SUM(he.nombre_heures * eq.coefficient), 0) as heures_equivalentes,
              th.montant as taux,
              COALESCE(SUM(he.nombre_heures * eq.coefficient) * th.montant, 0) as montant_total
       FROM enseignants e
       LEFT JOIN heures_effectuees he ON he.enseignant_id = e.id AND he.annee_academique_id = $2
       LEFT JOIN equivalences eq ON he.equivalence_id = eq.id
       LEFT JOIN taux_horaires th ON th.categorie = e.categorie AND th.annee_academique_id = $2
       WHERE e.id = $1
       GROUP BY e.categorie, th.montant`,
      [enseignantId, anneeId]
    );
    return rows[0];
  }
};