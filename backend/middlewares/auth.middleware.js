import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { jwtConfig } from '../config/auth.js';

export const verifierToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Token requis' });
    }

    const parts = authHeader.split(' ');
    let token;
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    } else if (parts.length === 1) {
      token = parts[0];
    } else {
      return res.status(401).json({ success: false, message: 'Format token invalide' });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    req.utilisateur = decoded;

    const { rows } = await query('SELECT id, email, role, actif FROM utilisateurs WHERE id = $1', [decoded.id]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (!rows[0].actif) {
      return res.status(403).json({ success: false, message: 'Compte désactivé' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expiré', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

export const verifierRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.utilisateur?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: `Accès refusé. Rôles requis: ${roles.join(', ')}` });
    }
    next();
  };
};