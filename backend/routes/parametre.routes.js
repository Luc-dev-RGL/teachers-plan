import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// ============ ÉQUIVALENCES ============

// GET /api/equivalences
router.get('/equivalences', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equivalences ORDER BY type ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur équivalences:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/equivalences
router.post('/equivalences', async (req, res) => {
  try {
    const { type, coefficient, description } = req.body;
    const result = await pool.query(
      'INSERT INTO equivalences (type, coefficient, description) VALUES ($1, $2, $3) RETURNING *',
      [type, coefficient, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création équivalence:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/equivalences/:id
router.put('/equivalences/:id', async (req, res) => {
  try {
    const { coefficient, description } = req.body;
    const result = await pool.query(
      'UPDATE equivalences SET coefficient = $1, description = $2, modifie_le = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [coefficient, description, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Équivalence non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour équivalence:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ TAUX HORAIRES ============

// GET /api/taux-horaires
router.get('/taux-horaires', async (req, res) => {
  try {
    const { annee_academique_id, categorie } = req.query;
    let sql = `SELECT th.*, aa.libelle as annee_academique 
               FROM taux_horaires th 
               LEFT JOIN annees_academiques aa ON th.annee_academique_id = aa.id 
               WHERE 1=1`;
    const params = [];
    let index = 1;

    if (annee_academique_id) {
      sql += ` AND th.annee_academique_id = $${index++}`;
      params.push(annee_academique_id);
    }
    if (categorie) {
      sql += ` AND th.categorie = $${index++}`;
      params.push(categorie);
    }

    sql += ' ORDER BY th.categorie ASC, th.type_seance ASC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur taux horaires:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/taux-horaires
router.post('/taux-horaires', async (req, res) => {
  try {
    const { annee_academique_id, categorie, type_seance, montant } = req.body;
    const result = await pool.query(
      `INSERT INTO taux_horaires (annee_academique_id, categorie, type_seance, montant) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [annee_academique_id, categorie, type_seance, montant]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création taux horaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/taux-horaires/:id
router.put('/taux-horaires/:id', async (req, res) => {
  try {
    const { categorie, type_seance, montant } = req.body;
    const result = await pool.query(
      `UPDATE taux_horaires SET categorie = $1, type_seance = $2, montant = $3, modifie_le = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`,
      [categorie, type_seance, montant, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Taux horaire non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour taux horaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/taux-horaires/:id
router.delete('/taux-horaires/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM taux_horaires WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Taux horaire non trouvé' });
    }
    res.json({ message: 'Taux horaire supprimé' });
  } catch (error) {
    console.error('Erreur suppression taux horaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/annees-academiques/:id
router.put('/annees-academiques/:id', async (req, res) => {
  try {
    const { libelle, date_debut, date_fin, actif } = req.body;

    if (actif) {
      await pool.query('UPDATE annees_academiques SET actif = false WHERE actif = true AND id != $1', [req.params.id]);
    }

    const result = await pool.query(
      'UPDATE annees_academiques SET libelle = $1, date_debut = $2, date_fin = $3, actif = $4, modifie_le = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [libelle, date_debut, date_fin, actif || false, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Année académique non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour année académique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============ PARAMÈTRES GÉNÉRAUX (fallback) ============

// GET /api/parametres
router.get('/', async (req, res) => {
  try {
    const equivalences = await pool.query('SELECT * FROM equivalences ORDER BY type ASC');
    const annees = await pool.query('SELECT * FROM annees_academiques ORDER BY date_debut DESC');

    res.json({
      equivalences: equivalences.rows,
      annees_academiques: annees.rows,
    });
  } catch (error) {
    console.error('Erreur paramètres:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;