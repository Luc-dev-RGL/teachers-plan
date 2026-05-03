import { query } from '../config/db.js';

export const JournalAuditModel = {
  findAll: async (limit = 100) => {
    const { rows } = await query(
      `SELECT ja.*, u.email as utilisateur_email
       FROM journal_audit ja
       LEFT JOIN utilisateurs u ON ja.utilisateur_id = u.id
       ORDER BY ja.date_action DESC LIMIT $1`, [limit]
    );
    return rows;
  },
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO journal_audit (utilisateur_id, action_type, table_concernee, enregistrement_id, details, adresse_ip) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.utilisateur_id, data.action_type, data.table_concernee, data.enregistrement_id, data.details, data.adresse_ip]
    );
    return rows[0];
  }
};