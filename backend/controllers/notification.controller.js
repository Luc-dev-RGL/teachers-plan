import { query } from '../config/db.js';

export const getAll = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM journal_audit
       WHERE utilisateur_id = $1
       ORDER BY date_action DESC LIMIT 20`,
      [req.utilisateur.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};