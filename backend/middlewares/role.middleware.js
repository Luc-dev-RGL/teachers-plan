export const roleMiddleware = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' });
    }
    next();
  };
};