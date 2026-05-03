import { DepartementModel } from '../models/Departement.js';

export const getAll = async (req, res) => {
  try {
    const data = await DepartementModel.findAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await DepartementModel.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Département non trouvé' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await DepartementModel.create(req.body);
    res.status(201).json({ success: true, data, message: 'Département créé avec succès' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Ce code de département existe déjà' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await DepartementModel.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Département non trouvé' });
    res.json({ success: true, data, message: 'Département mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await DepartementModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Département non trouvé' });
    res.json({ success: true, message: 'Département supprimé' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Impossible de supprimer: ce département est lié à d\'autres enregistrements' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};