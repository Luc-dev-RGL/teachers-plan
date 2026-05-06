import { query } from '../config/db.js';

export const NiveauModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT n.*, f.nom as filiere_nom
       FROM niveaux n
       LEFT JOIN filieres f ON n.filiere_id = f.id
       ORDER BY n.nom ASC`
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      `SELECT n.*, f.nom as filiere_nom
       FROM niveaux n
       LEFT JOIN filieres f ON n.filiere_id = f.id
       WHERE n.id = $1`, [id]
    );
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO niveaux (code, nom, filiere_id, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.code, data.nom, data.filiere_id, data.description]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['code', 'nom', 'filiere_id', 'description'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE niveaux SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM niveaux WHERE id = $1', [id]);
    return rowCount > 0;
  }
};