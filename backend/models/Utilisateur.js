import { query } from '../config/db.js';

export const UtilisateurModel = {
  findByEmail: async (email) => {
    const { rows } = await query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.actif, u.date_creation,
              e.id as enseignant_id, e.matricule, e.nom, e.prenom, e.telephone,
              e.grade, e.statut as enseignant_statut,
              d.nom as departement_nom
       FROM utilisateurs u
       LEFT JOIN enseignants e ON e.utilisateur_id = u.id
       LEFT JOIN departements d ON e.departement_id = d.id
       WHERE u.email = $1`, [email]
    );
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await query(
      `SELECT u.id, u.email, u.role, u.actif, u.date_creation,
              e.id as enseignant_id, e.matricule, e.nom, e.prenom, e.telephone,
              e.grade, e.statut as enseignant_statut,
              d.nom as departement_nom
       FROM utilisateurs u
       LEFT JOIN enseignants e ON e.utilisateur_id = u.id
       LEFT JOIN departements d ON e.departement_id = d.id
       WHERE u.id = $1`, [id]
    );
    return rows[0];
  },

  findAll: async (filters = {}) => {
    let sql = `SELECT u.id, u.email, u.role, u.actif, u.date_creation,
                      e.id as enseignant_id, e.matricule, e.nom, e.prenom, e.telephone,
                      e.grade, e.statut as enseignant_statut,
                      d.nom as departement_nom
               FROM utilisateurs u
               LEFT JOIN enseignants e ON e.utilisateur_id = u.id
               LEFT JOIN departements d ON e.departement_id = d.id`;
    const params = [];
    const conditions = [];
    if (filters.role) { params.push(filters.role); conditions.push(`u.role = $${params.length}`); }
    if (filters.search) {
      params.push(`%${filters.search}%`);
      conditions.push(`(u.email ILIKE $${params.length} OR e.nom ILIKE $${params.length} OR e.prenom ILIKE $${params.length})`);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY u.date_creation DESC';
    const { rows } = await query(sql, params);
    return rows;
  },

  create: async ({ email, password_hash, role, actif = true }) => {
    const { rows } = await query(
      `INSERT INTO utilisateurs (email, password_hash, role, actif)
       VALUES ($1, $2, $3, $4) RETURNING id, email, role, actif, date_creation`,
      [email, password_hash, role, actif]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const allowedFields = ['email', 'role', 'actif', 'password_hash'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && allowedFields.includes(key)) { fields.push(`${key} = $${idx++}`); params.push(val); }
    }
    if (!fields.length) return null;
    params.push(id);
    const { rows } = await query(
      `UPDATE utilisateurs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, email, role, actif, date_creation`,
      params
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rowCount } = await query('DELETE FROM utilisateurs WHERE id = $1', [id]);
    return rowCount > 0;
  }
};