import { query } from '../config/db.js';

export const ParametresNiveauxModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT pn.*, n.nom as niveau_nom
       FROM parametres_niveaux pn
       LEFT JOIN niveaux n ON pn.niveau_id = n.id
       ORDER BY n.nom`
    );
    return rows;
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO parametres_niveaux (niveau_id, semestre, date_debut, date_fin, actif) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.niveau_id, data.semestre, data.date_debut, data.date_fin, data.actif||true]
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
    const { rows } = await query(`UPDATE parametres_niveaux SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM parametres_niveaux WHERE id = $1', [id]);
    return rowCount > 0;
  }
};