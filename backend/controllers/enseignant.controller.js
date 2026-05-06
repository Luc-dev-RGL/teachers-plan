import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

export const getAll = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT e.*, d.nom AS departement_nom,
             (SELECT COALESCE(SUM(he.nombre_heures), 0)
              FROM heures_effectuees he WHERE he.enseignant_id = e.id) AS heures
      FROM enseignants e
      LEFT JOIN departements d ON e.departement_id = d.id
      ORDER BY e.nom ASC
    `);
    const data = rows.map(row => ({
      ...row,
      prenom: row.prenom || '',
      prenoms: row.prenom || '',
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT e.*, d.nom AS departement_nom,
             (SELECT COALESCE(SUM(he.nombre_heures), 0)
              FROM heures_effectuees he WHERE he.enseignant_id = e.id) AS heures
      FROM enseignants e
      LEFT JOIN departements d ON e.departement_id = d.id
      WHERE e.id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    const row = rows[0];
    res.json({ success: true, data: { ...row, prenoms: row.prenom || '' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mapping grade → catégorie salariale
const gradeToCategorie = (grade) => {
  const map = {
    'Professeur': 'A',
    'Maître de Conférences': 'A',
    'Maître Assistant': 'B',
    'Docteur': 'B',
    'Attaché': 'C',
    'Assistant': 'C',
    'Vacataire': 'D',
  };
  return map[grade] || 'D';
};

export const create = async (req, res) => {
  try {
    const { nom, prenoms, email, telephone, grade, departement_id, statut } = req.body;

    if (!nom || !prenoms || !email) {
      return res.status(400).json({ success: false, message: 'Nom, prénoms et email sont obligatoires' });
    }

    const emailCheck = await query('SELECT id FROM enseignants WHERE email = $1', [email.toLowerCase()]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    const matricule = `ENS-${Date.now().toString(36).toUpperCase()}`;
    const categorie = gradeToCategorie(grade);

    // Créer l'enseignant
    const { rows } = await query(`
      INSERT INTO enseignants (nom, prenom, email, telephone, grade, categorie, departement_id, statut, matricule)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [nom, prenoms, email.toLowerCase(), telephone || null, grade || 'Assistant', categorie, departement_id || null, statut || 'actif', matricule]);

    const row = rows[0];

    // Créer le compte utilisateur lié
    try {
      const hashedPassword = await bcrypt.hash('pass1234', 10);
      await query(
        'INSERT INTO utilisateurs (email, password_hash, role, actif) VALUES ($1, $2, $3, $4)',
        [email.toLowerCase(), hashedPassword, 'enseignant', true]
      );
    } catch (userErr) {
      console.log('Compte utilisateur déjà existant:', userErr.message);
    }

    res.status(201).json({
      success: true,
      data: { ...row, prenoms: row.prenom }
    });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Email ou matricule déjà existant' });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenoms, email, telephone, grade, departement_id, statut } = req.body;
    const categorie = grade ? gradeToCategorie(grade) : null;

    const { rows } = await query(`
      UPDATE enseignants
      SET nom = COALESCE($1, nom),
          prenom = COALESCE($2, prenom),
          email = COALESCE($3, email),
          telephone = COALESCE($4, telephone),
          grade = COALESCE($5, grade),
          categorie = COALESCE($6, categorie),
          departement_id = COALESCE($7, departement_id),
          statut = COALESCE($8, statut)
      WHERE id = $9 RETURNING *
    `, [nom, prenoms, email, telephone, grade, categorie, departement_id, statut, id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    const row = rows[0];
    res.json({ success: true, data: { ...row, prenoms: row.prenom } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM enseignants WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    res.json({ success: true, message: 'Enseignant supprimé' });
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ success: false, message: 'Impossible: données liées existantes' });
    res.status(500).json({ success: false, message: err.message });
  }
};