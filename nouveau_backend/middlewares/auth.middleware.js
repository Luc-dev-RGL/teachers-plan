import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { jwtConfig } from '../config/auth.js';

/**
 * Middleware de vérification du token JWT
 * Vérifie que le token est valide et que l'utilisateur existe
 */
export const verifierToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        succes: false, 
        message: 'Token d\'authentification requis' 
      });
    }

    const parts = authHeader.split(' ');
    let token;
    
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    } else if (parts.length === 1) {
      token = parts[0];
    } else {
      return res.status(401).json({ 
        succes: false, 
        message: 'Format du token invalide. Utilisez: Bearer <token>' 
      });
    }

    // Vérification du token
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.utilisateur = decoded;

    // Vérification que l'utilisateur existe toujours
    const { rows } = await query(
      'SELECT id, email, role, actif FROM utilisateurs WHERE id = $1', 
      [decoded.id]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ 
        succes: false, 
        message: 'Utilisateur non trouvé ou supprimé' 
      });
    }
    
    if (!rows[0].actif) {
      return res.status(403).json({ 
        succes: false, 
        message: 'Compte utilisateur désactivé. Contactez l\'administrateur.' 
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        succes: false, 
        message: 'Session expirée. Veuillez vous reconnecter.',
        code: 'TOKEN_EXPIRE' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        succes: false, 
        message: 'Token invalide. Veuillez vous reconnecter.' 
      });
    }
    
    console.error('Erreur lors de la vérification du token:', error);
    return res.status(401).json({ 
      succes: false, 
      message: 'Erreur d\'authentification' 
    });
  }
};

/**
 * Middleware de vérification des rôles
 * @param  {...string} roles - Rôles autorisés à accéder à la route
 */
export const verifierRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.utilisateur?.role;
    
    if (!userRole) {
      return res.status(401).json({ 
        succes: false, 
        message: 'Utilisateur non authentifié' 
      });
    }
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        succes: false, 
        message: `Accès refusé. Cette action nécessite l'un des rôles suivants: ${roles.join(', ')}`,
        role_requis: roles 
      });
    }
    
    next();
  };
};

/**
 * Middleware optionnel : ajoute les infos utilisateur si token présent
 * Ne bloque pas si pas de token
 */
export const tokenOptionnel = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    let token;
    
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    } else if (parts.length === 1) {
      token = parts[0];
    } else {
      return next();
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    req.utilisateur = decoded;
  } catch (error) {
    // Token invalide, on continue sans
  }
  
  next();
};
