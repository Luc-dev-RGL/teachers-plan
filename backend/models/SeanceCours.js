import { query } from '../config/db.js';

export const SeanceCoursModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT sc.*, e.nom as enseignant_nom, e.prenom as enseignant_prenom,
              m.nom as matiere_nom, s.nom as salle_nom, c.nom as classe_nom
       FROM seances_cours sc
       LEFT JOIN enseignants e ON sc.enseignant_id = e.id
       LEFT JOIN matieres m ON sc.matiere_id = m.id
       LEFT JOIN salles s ON sc.salle_id = s.id
       LEFT JOIN classes c ON sc.classe_id = c.id
       ORDER BY sc.date_debut`
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      `SELECT sc.*, e.nom as enseignant_nom, e.prenom as enseignant_prenom,
              m.nom as matiere_nom, s.nom as salle_nom, c.nom as classe_nom
       FROM seances_cours sc
       LEFT JOIN enseignants e ON sc.enseignant_id = e.id
       LEFT JOIN matieres m ON sc.matiere_id = m.id
       LEFT JOIN salles s ON sc.salle_id = s.id
       LEFT JOIN classes c ON sc.classe_id = c.id
       WHERE sc.id = $1`, [id]
    );
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      `INSERT INTO seances_cours (enseignant_id, matiere_id, salle_id, classe_id,
        annee_academique_id, date_debut, date_fin, type_seance, statut)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.enseignant_id, data.matiere_id, data.salle_id, data.classe_id,
       data.annee_academique_id, data.date_debut, data.date_fin,
       data.type_seance||'CM', data.statut||'planifiee']
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
    const { rows } = await query(`UPDATE seances_cours SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM seances_cours WHERE id = $1', [id]);
    return rowCount > 0;
  },
  checkConflict: async (salle_id, date_debut, date_fin, exclude_id = null) => {
    let sql = `SELECT * FROM seances_cours WHERE salle_id = $1 AND date_debut < $3 AND date_fin > $2 AND statut != 'annulee'`;
    const params = [salle_id, date_debut, date_fin];
    if (exclude_id) { sql += ' AND id != $4'; params.push(exclude_id); }
    const { rows } = await query(sql, params);
    return rows;
  }
};