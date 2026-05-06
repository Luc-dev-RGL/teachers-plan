import { query } from '../config/db.js';

export const FiliereModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT f.*, d.nom as departement_nom
       FROM filieres f LEFT JOIN departements d ON f.departement_id = d.id ORDER BY f.nom`
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      `SELECT f.*, d.nom as departement_nom
       FROM filieres f LEFT JOIN departements d ON f.departement_id = d.id WHERE f.id = $1`, [id]
    );
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO filieres (code, nom, departement_id, description, responsable) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.code, data.nom, data.departement_id, data.description, data.responsable]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['code', 'nom', 'departement_id', 'description', 'responsable'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE filieres SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM filieres WHERE id = $1', [id]);
    return rowCount > 0;
  }
};