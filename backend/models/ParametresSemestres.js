import { query } from '../config/db.js';

export const ParametresSemestresModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT ps.*, aa.libelle as annee_libelle
       FROM parametres_semestres ps
       LEFT JOIN annees_academiques aa ON ps.annee_academique_id = aa.id
       ORDER BY ps.date_debut`
    );
    return rows;
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO parametres_semestres (annee_academique_id, semestre, date_debut, date_fin, actif) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.annee_academique_id, data.semestre, data.date_debut, data.date_fin, data.actif||true]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE parametres_semestres SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM parametres_semestres WHERE id = $1', [id]);
    return rowCount > 0;
  }
};