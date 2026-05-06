import { UtilisateurModel } from '../models/Utilisateur.js';
import bcrypt from 'bcryptjs';

export const getAll = async (req, res) => {
  try {
    const data = await UtilisateurModel.findAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    const hash = await bcrypt.hash(password, 10);
    const data = await UtilisateurModel.create({ email, password_hash: hash, role: role || 'enseignant', actif: true });
    res.status(201).json({ success: true, data, message: 'Utilisateur cree' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'Email deja utilise' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await UtilisateurModel.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await UtilisateurModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
    res.json({ success: true, message: 'Utilisateur supprime' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};