import express from 'express';
import { query } from '../config/db.js';
import { verifierToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifierToken, async (req, res) => {
  try {
    const { limit = 20, utilisateur_id } = req.query;
    const id = utilisateur_id || req.utilisateur.id;
    const result = await query(
      `SELECT * FROM journal_audit WHERE utilisateur_id = $1 ORDER BY date_action DESC LIMIT $2`,
      [id, parseInt(limit)]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;