/**
 * Configuration JWT
 */
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'secret_par_defaut_a_changer_absolument',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

/**
 * Options de hachage pour les mots de passe
 */
export const bcryptOptions = {
  rounds: 10,
};

/**
 * Rôles disponibles dans l'application
 */
export const ROLES = {
  ADMIN: 'admin',
  RH: 'rh',
  ENSEIGNANT: 'enseignant',
};

/**
 * Statuts possibles pour les séances
 */
export const STATUT_SEANCE = {
  PLANIFIEE: 'planifiée',
  REALISEE: 'réalisée',
  ANNULEE: 'annulée',
  EN_ATTENTE: 'en_attente',
  VALIDEO: 'validée',
};

/**
 * Types de séances
 */
export const TYPE_SEANCE = {
  CM: 'CM',
  TD: 'TD',
  TP: 'TP',
};
