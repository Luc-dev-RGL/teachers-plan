import { query } from '../config/db.js';

export const HeuresEffectueesModel = {
  findAll: async () => {
    const { rows } = await query(
      `SELECT he.*, e.matricule, e.nom as enseignant_nom, e.prenom as enseignant_prenom,
              eq.type_heure, eq.coefficient,
              (he.nombre_heures * eq.coefficient) as heures_equivalentes,
              u_saisie.email as saisie_par_email,
              u_valide.email as valide_par_email
       FROM heures_effectuees he
       LEFT JOIN enseignants e ON he.enseignant_id = e.id
       LEFT JOIN equivalences eq ON he.equivalence_id = eq.id
       LEFT JOIN utilisateurs u_saisie ON he.saisie_par = u_saisie.id
       LEFT JOIN utilisateurs u_valide ON he.valide_par = u_valide.id
       ORDER BY he.date_saisie DESC`
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query('SELECT * FROM heures_effectuees WHERE id = $1', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { rows } = await query(
      `INSERT INTO heures_effectuees (enseignant_id, equivalence_id, annee_academique_id,
        nombre_heures, mois, commentaire, saisie_par)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.enseignant_id, data.equivalence_id, data.annee_academique_id,
       data.nombre_heures, data.mois, data.commentaire, data.saisie_par]
    );
    return rows[0];
  },
  update: async (id, data) => {
    const allowedFields = ['enseignant_id', 'equivalence_id', 'annee_academique_id',
      'nombre_heures', 'mois', 'commentaire', 'validee', 'valide_par'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(`UPDATE heures_effectuees SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return rows[0];
  },
  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM heures_effectuees WHERE id = $1', [id]);
    return rowCount > 0;
  }
};