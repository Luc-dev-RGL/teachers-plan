import { query } from '../config/db.js';

export const ReinitialisationMdpModel = {
  create: async (data) => {
    const { rows } = await query(
      'INSERT INTO reinitialisations_mdp (utilisateur_id, token, date_expiration) VALUES ($1, $2, $3) RETURNING *',
      [data.utilisateur_id, data.token, data.date_expiration]
    );
    return rows[0];
  },
  findByToken: async (token) => {
    const { rows } = await query(
      'SELECT * FROM reinitialisations_mdp WHERE token = $1 AND utilise = false AND date_expiration > NOW()',
      [token]
    );
    return rows[0];
  },
  markUsed: async (id) => {
    const { rows } = await query('UPDATE reinitialisations_mdp SET utilise = true WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
};