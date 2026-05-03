import JournalAction from '../models/JournalAction.js';

export const auditMiddleware = async (req, res, next) => {
  await next();

  if (req.utilisateur && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    try {
      const action = req.method === 'POST' ? 'CREATION'
        : req.method === 'PUT' ? 'MODIFICATION'
        : req.method === 'PATCH' ? 'VALIDATION'
        : 'SUPPRESSION';

      const entite = req.originalUrl.split('/api/')[1]?.split('/')[0] || 'inconnu';

      await JournalAction.enregistrer({
        utilisateur_id: req.utilisateur.id,
        action,
        entite,
        entite_id: req.params.id || null,
        adresse_ip: req.ip,
      });
    } catch (erreur) {
      console.error('Erreur audit :', erreur.message);
    }
  }
};