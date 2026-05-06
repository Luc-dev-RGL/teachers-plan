import { query } from '../config/db.js';

export const EnseignantModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT e.*, d.nom as departement_nom,
              u.email as utilisateur_email
       FROM enseignants e
       LEFT JOIN departements d ON e.departement_id = d.id
       LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
       ORDER BY e.nom`
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      `SELECT e.*, d.nom as departement_nom,
              u.email as utilisateur_email
       FROM enseignants e
       LEFT JOIN departements d ON e.departement_id = d.id
       LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
       WHERE e.id = $1`, [id]
    );
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      `INSERT INTO enseignants (matricule, nom, prenom, email, utilisateur_id, telephone,
        date_naissance, departement_id, categorie, grade, statut)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [data.matricule, data.nom, data.prenom, data.email, data.utilisateur_id, data.telephone,
       data.date_naissance, data.departement_id, data.categorie || 'Vacataire', data.grade, data.statut || 'actif']
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['nom', 'prenom', 'email', 'telephone', 'date_naissance', 'departement_id', 'categorie', 'grade', 'statut'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE enseignants SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM enseignants WHERE id = $1', [id]);
    return rowCount > 0;
  }
};