import express from 'express';
import pool from '../config/db.js';
import { verifierToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/journal-actions
router.get('/', verifierToken, async (req, res) => {
  try {
    const { limit = 20, utilisateur_id } = req.query;
    const id = utilisateur_id || req.utilisateur.id;
    const result = await pool.query(
      `SELECT * FROM journal_actions WHERE utilisateur_id = $1 ORDER BY cree_le DESC LIMIT $2`,
      [id, parseInt(limit)]
    );
    res.json({ succes: true, donnees: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
