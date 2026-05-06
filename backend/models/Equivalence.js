import { query } from '../config/db.js';

export const EquivalenceModel = {
  findAll: async () => {
    const { rows } = await query('SELECT * FROM equivalences ORDER BY type_heure');
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM equivalences WHERE id = $1', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO equivalences (type_heure, coefficient, description) VALUES ($1, $2, $3) RETURNING *',
      [data.type_heure, data.coefficient, data.description]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['type_heure', 'coefficient', 'description'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE equivalences SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM equivalences WHERE id = $1', [id]);
    return rowCount > 0;
  }
};