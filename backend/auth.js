import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const genererToken = (utilisateur) => {
  return jwt.sign(
    {
      id: utilisateur.id,
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      role: utilisateur.role,
      enseignant_id: utilisateur.enseignant_id || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const verifierToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const hacherMotDePasse = async (motDePasse) => {
  return await bcrypt.hash(motDePasse, 10);
};

export const comparerMotDePasse = async (motDePasse, hash) => {
  return await bcrypt.compare(motDePasse, hash);
};