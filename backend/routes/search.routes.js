import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ succes: true, donnees: [] });
    }

    const term = `%${q.trim()}%`;
    let results = [];

    if (!type || type === 'enseignant') {
      const r = await pool.query(
        `SELECT e.id, e.matricule, u.nom, u.prenom, u.email, 'enseignant' as type
         FROM enseignants e JOIN utilisateurs u ON e.utilisateur_id = u.id
         WHERE u.nom ILIKE $1 OR u.prenom ILIKE $1 OR e.matricule ILIKE $1
         ORDER BY u.nom ASC LIMIT 5`, [term]
      );
      results.push(...r.rows);
    }

    if (!type || type === 'departement') {
      const r = await pool.query(
        `SELECT id, nom, code, 'departement' as type FROM departements
         WHERE nom ILIKE $1 OR code ILIKE $1 ORDER BY nom ASC LIMIT 5`, [term]
      );
      results.push(...r.rows);
    }

    if (!type || type === 'matiere') {
      const r = await pool.query(
        `SELECT id, nom, code, 'matiere' as type FROM matieres
         WHERE nom ILIKE $1 OR code ILIKE $1 ORDER BY nom ASC LIMIT 5`, [term]
      );
      results.push(...r.rows);
    }

    if (!type || type === 'salle') {
      const r = await pool.query(
        `SELECT id, nom, code, 'salle' as type FROM salles
         WHERE nom ILIKE $1 OR code ILIKE $1 ORDER BY nom ASC LIMIT 5`, [term]
      );
      results.push(...r.rows);
    }

    if (!type || type === 'classe') {
      const r = await pool.query(
        `SELECT id, nom, code, 'classe' as type FROM classes
         WHERE nom ILIKE $1 OR code ILIKE $1 ORDER BY nom ASC LIMIT 5`, [term]
      );
      results.push(...r.rows);
    }

    if (!type || type === 'filiere') {
      const r = await pool.query(
        `SELECT id, nom, code, 'filiere' as type FROM filieres
         WHERE nom ILIKE $1 OR code ILIKE $1 ORDER BY nom ASC LIMIT 5`, [term]
      );
      results.push(...r.rows);
    }

    if (!type || type === 'seance') {
      const r = await pool.query(
        `SELECT sc.id, sc.date, sc.heure_debut, m.nom as matiere_nom, 'seance' as type
         FROM seances_cours sc JOIN matieres m ON sc.matiere_id = m.id
         WHERE m.nom ILIKE $1 OR sc.date::text ILIKE $1
         ORDER BY sc.date DESC LIMIT 5`, [term]
      );
      results.push(...r.rows);
    }

    res.json({ succes: true, donnees: results.slice(0, 20) });
  } catch (error) {
    console.error('Erreur recherche:', error);
    res.status(500).json({ succes: false, message: 'Erreur serveur' });
  }
});

export default router;