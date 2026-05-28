/**
 * Middleware de gestion centralisée des erreurs
 * Toutes les erreurs passent par ici pour un formatage cohérent
 */
export const gestionnaireErreurs = (erreur, req, res, next) => {
  console.error('❌ Erreur serveur:', erreur);

  // Erreur de contrainte unique (doublon)
  if (erreur.code === '23505') {
    const champ = Object.keys(erreur.detail || {}).join(', ') || 'valeur';
    return res.status(409).json({
      succes: false,
      message: `Ce ${champ} existe déjà dans la base de données`,
      code: 'DONNEE_EXISTANTE'
    });
  }

  // Erreur de contrainte de clé étrangère
  if (erreur.code === '23503') {
    return res.status(409).json({
      succes: false,
      message: 'Suppression impossible : cet élément est lié à d\'autres données',
      code: 'DONNEES_LIEES'
    });
  }

  // Erreur de contrainte NOT NULL
  if (erreur.code === '23502') {
    return res.status(400).json({
      succes: false,
      message: 'Donnée obligatoire manquante',
      code: 'DONNEE_MANQUANTE'
    });
  }

  // Erreur de validation personnalisée
  if (erreur.type === 'ValidationError') {
    return res.status(400).json({
      succes: false,
      message: erreur.message,
      code: 'VALIDATION_ECHEC'
    });
  }

  // Erreur JWT
  if (erreur.name === 'JsonWebTokenError') {
    return res.status(401).json({
      succes: false,
      message: 'Token invalide',
      code: 'TOKEN_INVALIDE'
    });
  }

  // Erreur JWT - Token expiré
  if (erreur.name === 'TokenExpiredError') {
    return res.status(401).json({
      succes: false,
      message: 'Session expirée. Veuillez vous reconnecter.',
      code: 'TOKEN_EXPIRE'
    });
  }

  // Erreur Multer (upload de fichier)
  if (erreur.name === 'MulterError') {
    if (erreur.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        succes: false,
        message: 'Fichier trop volumineux. Taille maximale dépassée.',
        code: 'FICHIER_TROP_GROS'
      });
    }
    return res.status(400).json({
      succes: false,
      message: 'Erreur lors de l\'upload du fichier',
      code: 'UPLOAD_ECHEC'
    });
  }

  // Erreur non gérée - 500
  res.status(erreur.statusCode || 500).json({
    succes: false,
    message: erreur.message || 'Erreur interne du serveur',
    code: erreur.code || 'ERREUR_INTERNE',
    details: process.env.NODE_ENV === 'development' ? erreur.stack : undefined
  });
};

/**
 * Middleware pour les routes non trouvées (404)
 */
export const routeNonTrouvee = (req, res, next) => {
  res.status(404).json({
    succes: false,
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NON_TROUVEE'
  });
};
