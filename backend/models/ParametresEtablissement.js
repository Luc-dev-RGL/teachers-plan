import { query } from '../config/db.js';

export const ParametresEtablissementModel = {
  find: async () => {
    const { rows } = await query('SELECT * FROM parametres_etablissement LIMIT 1');
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
    const { rows } = await query(`UPDATE parametres_etablissement SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  }
};