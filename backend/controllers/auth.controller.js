import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { jwtConfig } from '../config/auth.js';

export const login = async (req, res) => {
  console.log('Tentative de login avec:', req.body.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const { rows } = await query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.actif, u.date_creation,
              e.id as enseignant_id, e.matricule, e.nom, e.prenom, e.grade, e.telephone,
              e.statut as enseignant_statut,
              d.nom as departement_nom
       FROM utilisateurs u
       LEFT JOIN enseignants e ON e.utilisateur_id = u.id
       LEFT JOIN departements d ON e.departement_id = d.id
       WHERE u.email = $1`, [email]
    );

    const utilisateur = rows[0];

    if (!utilisateur) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const passwordMatch = await bcrypt.compare(password, utilisateur.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    if (!utilisateur.actif) {
      return res.status(403).json({ success: false, message: 'Compte desactive' });
    }

    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role, enseignant_id: utilisateur.enseignant_id },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    console.log('Connexion reussie pour:', utilisateur.email);
    res.json({
      success: true,
      message: 'Connexion reussie',
      data: {
        token,
        utilisateur: {
          id: utilisateur.id,
          email: utilisateur.email,
          role: utilisateur.role,
          enseignant_id: utilisateur.enseignant_id,
          prenom: utilisateur.prenom,
          nom: utilisateur.nom,
          matricule: utilisateur.matricule,
          grade: utilisateur.grade,
          telephone: utilisateur.telephone,
          departement_nom: utilisateur.departement_nom,
        }
      }
    });
  } catch (error) {
    console.error('Erreur login:', error.message);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};

export const getMe = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.email, u.role, u.actif, u.date_creation,
              e.id as enseignant_id, e.matricule, e.nom, e.prenom, e.grade, e.telephone,
              e.statut as enseignant_statut,
              d.nom as departement_nom
       FROM utilisateurs u
       LEFT JOIN enseignants e ON e.utilisateur_id = u.id
       LEFT JOIN departements d ON e.departement_id = d.id
       WHERE u.id = $1`, [req.utilisateur.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { ancien_password, nouveau_password } = req.body;
    if (!ancien_password || !nouveau_password) {
      return res.status(400).json({ success: false, message: 'Les deux mots de passe requis' });
    }
    const { rows } = await query('SELECT password_hash FROM utilisateurs WHERE id = $1', [req.utilisateur.id]);
    const match = await bcrypt.compare(ancien_password, rows[0].password_hash);
    if (!match) return res.status(400).json({ success: false, message: 'Ancien mot de passe incorrect' });
    const hash = await bcrypt.hash(nouveau_password, 10);
    await query('UPDATE utilisateurs SET password_hash = $1 WHERE id = $2', [hash, req.utilisateur.id]);
    res.json({ success: true, message: 'Mot de passe modifie' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};