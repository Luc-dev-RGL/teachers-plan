import { query } from '../config/db.js';

export const AnneeAcademiqueModel = {
  findAll: async () => {
    const { rows } = await query('SELECT * FROM annees_academiques ORDER BY date_debut DESC');
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM annees_academiques WHERE id = $1', [id]);
    return rows[0];
  },
  getCurrent: async () => {
    const { rows } = await query('SELECT * FROM annees_academiques WHERE en_cours = true LIMIT 1');
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO annees_academiques (libelle, date_debut, date_fin, en_cours) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.libelle, data.date_debut, data.date_fin, data.en_cours||false]
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
    const { rows } = await query(`UPDATE annees_academiques SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM annees_academiques WHERE id = $1', [id]);
    return rowCount > 0;
  }
};