import pool from '../config/db.js';

// Récupérer toutes les heures effectuées (avec jointure enseignant + équivalence)
export const getAll = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT he.*, e.nom, e.prenom, e.matricule,
             eq.type_heure, eq.coefficient
      FROM heures_effectuees he
      LEFT JOIN enseignants e ON he.enseignant_id = e.id
      LEFT JOIN equivalences eq ON he.equivalence_id = eq.id
      ORDER BY he.date_saisie DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// Récupérer une heure effectuée par ID
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT he.*, e.nom, e.prenom, e.matricule,
             eq.type_heure, eq.coefficient
      FROM heures_effectuees he
      LEFT JOIN enseignants e ON he.enseignant_id = e.id
      LEFT JOIN equivalences eq ON he.equivalence_id = eq.id
      WHERE he.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Heure effectuée non trouvée' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Créer une nouvelle heure effectuée
export const create = async (req, res, next) => {
  try {
    const { enseignant_id, equivalence_id, nombre_heures, date_cours, description, statut } = req.body;

    const result = await pool.query(`
      INSERT INTO heures_effectuees (enseignant_id, equivalence_id, nombre_heures, date_cours, description, statut)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [enseignant_id, equivalence_id, nombre_heures, date_cours, description || null, statut || 'en_attente']);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Mettre à jour une heure effectuée
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enseignant_id, equivalence_id, nombre_heures, date_cours, description, statut } = req.body;

    const result = await pool.query(`
      UPDATE heures_effectuees
      SET enseignant_id = COALESCE($1, enseignant_id),
          equivalence_id = COALESCE($2, equivalence_id),
          nombre_heures = COALESCE($3, nombre_heures),
          date_cours = COALESCE($4, date_cours),
          description = COALESCE($5, description),
          statut = COALESCE($6, statut),
          date_modification = NOW()
      WHERE id = $7
      RETURNING *
    `, [enseignant_id, equivalence_id, nombre_heures, date_cours, description, statut, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Heure effectuée non trouvée' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Supprimer une heure effectuée
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM heures_effectuees WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Heure effectuée non trouvée' });
    }
    res.json({ success: true, message: 'Heure effectuée supprimée avec succès' });
  } catch (err) {
    next(err);
  }
};