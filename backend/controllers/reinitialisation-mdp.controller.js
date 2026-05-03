import crypto from 'crypto';
import { ReinitialisationMdpModel } from '../models/ReinitialisationMdp.js';
import { UtilisateurModel } from '../models/Utilisateur.js';
import bcrypt from 'bcryptjs';

export const demander = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const utilisateur = await UtilisateurModel.findByEmail(email);
    if (!utilisateur) return res.status(404).json({ success: false, message: 'Email non trouvé' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000); // 1 heure

    await ReinitialisationMdpModel.create({
      utilisateur_id: utilisateur.id,
      token,
      date_expiration: expiration
    });

    res.json({ success: true, message: 'Email de réinitialisation envoyé', token }); // en prod, envoyer par email
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifier = async (req, res) => {
  try {
    const { token, nouveau_password } = req.body;
    if (!token || !nouveau_password) return res.status(400).json({ success: false, message: 'Token et mot de passe requis' });

    const reset = await ReinitialisationMdpModel.findByToken(token);
    if (!reset) return res.status(400).json({ success: false, message: 'Token invalide ou expiré' });

    const hash = await bcrypt.hash(nouveau_password, 10);
    await UtilisateurModel.update(reset.utilisateur_id, { password_hash: hash });
    await ReinitialisationMdpModel.markUsed(reset.id);

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};