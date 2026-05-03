import { query } from '../config/db.js';

export const ProgrammeModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT p.*, e.nom as enseignant_nom, e.prenom as enseignant_prenom,
              m.nom as matiere_nom, c.nom as classe_nom
       FROM programmes p
       LEFT JOIN enseignants e ON p.enseignant_id = e.id
       LEFT JOIN matieres m ON p.matiere_id = m.id
       LEFT JOIN classes c ON p.classe_id = c.id
       ORDER BY p.jour_semaine, p.heure_debut`
    );
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
       data.type_seance||'CM']
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
    const { rows } = await query(`UPDATE programmes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM programmes WHERE id = $1', [id]);
    return rowCount > 0;
  }
};