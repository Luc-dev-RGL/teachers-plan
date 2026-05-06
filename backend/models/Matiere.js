import { query } from '../config/db.js';

export const MatiereModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT m.*, f.nom as filiere_nom, n.nom as niveau_nom
       FROM matieres m
       LEFT JOIN filieres f ON m.filiere_id = f.id
       LEFT JOIN niveaux n ON m.niveau_id = n.id
       ORDER BY m.nom`
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      `SELECT m.*, f.nom as filiere_nom, n.nom as niveau_nom
       FROM matieres m
       LEFT JOIN filieres f ON m.filiere_id = f.id
       LEFT JOIN niveaux n ON m.niveau_id = n.id
       WHERE m.id = $1`, [id]
    );
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      `INSERT INTO matieres (code, nom, description, credit, heures_cm, heures_td, heures_tp, coefficient, filiere_id, niveau_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [data.code, data.nom, data.description, data.credit || 2,
       data.heures_cm || 0, data.heures_td || 0, data.heures_tp || 0,
       data.coefficient || 1, data.filiere_id, data.niveau_id]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['code', 'nom', 'description', 'credit', 'heures_cm', 'heures_td', 'heures_tp', 'coefficient', 'filiere_id', 'niveau_id'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE matieres SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM matieres WHERE id = $1', [id]);
    return rowCount > 0;
  }
};