import { query } from '../config/db.js';

export const PresenceModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT p.*, e.matricule, e.nom as enseignant_nom, e.prenom as enseignant_prenom,
              sc.date_debut as seance_date, m.nom as matiere_nom
       FROM presences p
       LEFT JOIN enseignants e ON p.enseignant_id = e.id
       LEFT JOIN seances_cours sc ON p.seance_id = sc.id
       LEFT JOIN matieres m ON sc.matiere_id = m.id
       ORDER BY p.date_creation DESC`
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM presences WHERE id = $1', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO presences (seance_id, enseignant_id, date_presence, statut, commentaire) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.seance_id, data.enseignant_id, data.date_presence, data.statut || 'present', data.commentaire]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['seance_id', 'enseignant_id', 'date_presence', 'statut', 'commentaire'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE presences SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM presences WHERE id = $1', [id]);
    return rowCount > 0;
  }
};