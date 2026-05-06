import { query } from '../config/db.js';

export const SalleModel = {
  findAll: async () => {
    const { rows } = await query('SELECT * FROM salles ORDER BY nom');
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM salles WHERE id = $1', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO salles (code, nom, capacite, type, batiment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.code, data.nom, data.capacite, data.type, data.batiment]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['code', 'nom', 'capacite', 'type', 'batiment'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE salles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM salles WHERE id = $1', [id]);
    return rowCount > 0;
  }
};