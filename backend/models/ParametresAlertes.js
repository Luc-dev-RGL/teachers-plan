import { query } from '../config/db.js';

export const ParametresAlertesModel = {
  findAll: async () => {
    const { rows } = await query('SELECT * FROM parametres_alertes ORDER BY type_alerte');
    return rows;
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO parametres_alertes (type_alerte, description, actif, destinataires) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.type_alerte, data.description, data.actif||true, data.destinataires]
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
    const { rows } = await query(`UPDATE parametres_alertes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM parametres_alertes WHERE id = $1', [id]);
    return rowCount > 0;
  }
};