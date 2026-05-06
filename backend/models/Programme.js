import { query } from '../config/db.js';

export const ProgrammeModel = {
  findAll: async (filters = {}) => {
    let sql = `SELECT p.*, e.nom as enseignant_nom, e.prenom as enseignant_prenom,
              m.nom as matiere_nom, c.nom as classe_nom
       FROM programmes p
       LEFT JOIN enseignants e ON p.enseignant_id = e.id
       LEFT JOIN matieres m ON p.matiere_id = m.id
       LEFT JOIN classes c ON p.classe_id = c.id`;
    const params = [];
    const conditions = [];
    if (filters.enseignant_id) { params.push(filters.enseignant_id); conditions.push(`p.enseignant_id = $${params.length}`); }
    if (filters.classe_id) { params.push(filters.classe_id); conditions.push(`p.classe_id = $${params.length}`); }
    if (filters.annee_academique_id) { params.push(filters.annee_academique_id); conditions.push(`p.annee_academique_id = $${params.length}`); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY p.jour_semaine, p.heure_debut';
    const { rows } = await query(sql, params);
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM programmes WHERE id = $1', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      `INSERT INTO programmes (enseignant_id, matiere_id, salle_id, classe_id,
        annee_academique_id, jour_semaine, heure_debut, heure_fin, type_seance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.enseignant_id, data.matiere_id, data.salle_id, data.classe_id,
       data.annee_academique_id, data.jour_semaine, data.heure_debut, data.heure_fin,
       data.type_seance || 'CM']
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['enseignant_id', 'matiere_id', 'salle_id', 'classe_id',
      'annee_academique_id', 'jour_semaine', 'heure_debut', 'heure_fin', 'type_seance'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE programmes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM programmes WHERE id = $1', [id]);
    return rowCount > 0;
  }
};