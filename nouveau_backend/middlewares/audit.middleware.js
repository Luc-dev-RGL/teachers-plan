import { query } from '../config/db.js';

/**
 * Enregistre une action dans le journal d'audit
 * @param {object} options - Options d'audit
 * @param {string} options.utilisateurId - ID de l'utilisateur
 * @param {string} options.action - Type d'action (CREATE, UPDATE, DELETE, CONSULT)
 * @param {string} options.entite - Nom de l'entité concernée
 * @param {string} options.entiteId - ID de l'entité
 * @param {object} options.details - Détails supplémentaires
 * @param {string} options.adresseIp - IP du client
 */
export const auditer = async ({
  utilisateurId,
  action,
  entite,
  entiteId = null,
  details = {},
  adresseIp = null
}) => {
  try {
    await query(
      `INSERT INTO journal_audit (utilisateur_id, action, entite, entite_id, details, adresse_ip)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        utilisateurId || null,
        action,
        entite,
        entiteId || null,
        JSON.stringify(details),
        adresseIp || null
      ]
    );
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement dans le journal d\'audit:', error);
    // On ne bloque pas le processus principal pour une erreur d'audit
  }
};

/**
 * Middleware d'audit automatique pour les routes CRUD
 * @param {string} entite - Nom de l'entité à auditer
 */
export const auditMiddleware = (entite) => {
  return async (req, res, next) => {
    // On sauvegarde la méthode originale pour l'utiliser après
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      // Détermination du type d'action
      let action = 'CONSULT';
      if (req.method === 'POST') action = 'CREATION';
      else if (req.method === 'PUT' || req.method === 'PATCH') action = 'MODIFICATION';
      else if (req.method === 'DELETE') action = 'SUPPRESSION';
      
      // Récupération de l'ID de l'entité
      let entiteId = req.params.id || data?.data?.id || null;
      
      // Détails de l'audit
      const details = {
        methode: req.method,
        route: req.originalUrl,
        corps: req.body ? Object.keys(req.body) : null
      };
      
      // Enregistrement asynchrone (ne bloque pas la réponse)
      auditer({
        utilisateurId: req.utilisateur?.id,
        action,
        entite,
        entiteId,
        details,
        adresseIp: req.ip || req.connection?.remoteAddress
      });
      
      return originalJson(data);
    };
    
    next();
  };
};
