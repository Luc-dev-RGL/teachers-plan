import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/heures
router.get('/', async (req, res) => {
  try {
    const { enseignant_id, annee_academique_id, mois } = req.query;

    let sql = `SELECT he.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom, aa.libelle as annee_academique
               FROM heures_effectuees he
               LEFT JOIN enseignants e ON he.enseignant_id = e.id
               LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
               LEFT JOIN annees_academiques aa ON he.annee_academique_id = aa.id
               WHERE 1=1`;
    const params = [];
    let index = 1;

    if (enseignant_id) {
      sql += ` AND he.enseignant_id = $${index++}`;
      params.push(enseignant_id);
    }
    if (annee_academique_id) {
      sql += ` AND he.annee_academique_id = $${index++}`;
      params.push(annee_academique_id);
    }
    if (mois) {
      sql += ` AND he.mois = $${index++}`;
      params.push(mois);
    }

    sql += ' ORDER BY he.mois ASC, u.nom ASC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur heures:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/heures/total/:enseignant_id
router.get('/total/:enseignant_id', async (req, res) => {
  try {
    const { annee_academique_id } = req.query;

    let sql = `SELECT 
      COUNT(*) as nombre_seances,
      SUM(he.heures_reelles) as total_heures_reelles,
      SUM(he.heures_equiv_td) as total_heures_equiv_td,
      SUM(he.montant_calcule) as total_montant
      FROM heures_effectuees he
      WHERE he.enseignant_id = $1`;
    const params = [req.params.enseignant_id];
    let index = 2;

    if (annee_academique_id) {
      sql += ` AND he.annee_academique_id = $${index++}`;
      params.push(annee_academique_id);
    }

    const result = await pool.query(sql, params);
    const row = result.rows[0];
    res.json({
      nombre_seances: parseInt(row.nombre_seances || 0),
      total_heures_reelles: parseFloat(row.total_heures_reelles || 0),
      total_heures_equiv_td: parseFloat(row.total_heures_equiv_td || 0),
      total_montant: parseFloat(row.total_montant || 0),
    });
  } catch (error) {
    console.error('Erreur total heures:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/heures/:id
router.put('/:id', async (req, res) => {
  try {
    const { heures_reelles, coefficient, taux_horaire } = req.body;
    const heures_equiv_td = parseFloat(heures_reelles) * parseFloat(coefficient);
    const montant_calcule = heures_equiv_td * parseFloat(taux_horaire || 0);

    const result = await pool.query(
      `UPDATE heures_effectuees 
       SET heures_reelles = $1, coefficient = $2, taux_horaire = $3, heures_equiv_td = $4, montant_calcule = $5, modifie_le = CURRENT_TIMESTAMP 
       WHERE id = $6 
       RETURNING *`,
      [heures_reelles, coefficient, taux_horaire, heures_equiv_td, montant_calcule, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Non trouvé' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour heures:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;