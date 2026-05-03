import { query } from '../config/db.js';

export const ClasseModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT c.*, n.nom as niveau_nom, f.nom as filiere_nom
       FROM classes c
       LEFT JOIN niveaux n ON c.niveau_id = n.id
       LEFT JOIN filieres f ON n.filiere_id = f.id
       ORDER BY c.nom`
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      `SELECT c.*, n.nom as niveau_nom FROM classes c LEFT JOIN niveaux n ON c.niveau_id = n.id WHERE c.id = $1`, [id]
    );
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO classes (code, nom, niveau_id, annee_academique_id, effectif_max) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.code, data.nom, data.niveau_id, data.annee_academique_id, data.effectif_max]
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
    const { rows } = await query(`UPDATE classes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM classes WHERE id = $1', [id]);
    return rowCount > 0;
  }
};