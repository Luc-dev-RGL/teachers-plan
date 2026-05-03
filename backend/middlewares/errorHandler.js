export const errorHandler = (erreur, req, res, next) => {
  console.error('Erreur serveur :', erreur);

  if (erreur.code === '23505') {
    return res.status(409).json({
      succes: false,
      message: 'Cette valeur existe déjà dans la base de données',
    });
  }

  if (erreur.code === '23503') {
    return res.status(409).json({
      succes: false,
      message: 'Suppression impossible : cet élément est lié à d\'autres données',
    });
  }

  res.status(500).json({
    succes: false,
    message: 'Erreur interne du serveur',
    details: process.env.NODE_ENV === 'development' ? erreur.message : undefined,
  });
};