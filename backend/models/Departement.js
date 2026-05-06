import { query } from '../config/db.js';

export const DepartementModel = {
  findAll: async () => {
    const { rows } = await query('SELECT * FROM departements ORDER BY nom');
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM departements WHERE id = $1', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO departements (code, nom, description) VALUES ($1, $2, $3) RETURNING *',
      [data.code, data.nom, data.description]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['code', 'nom', 'description'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE departements SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM departements WHERE id = $1', [id]);
    return rowCount > 0;
  }
};