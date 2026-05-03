import { ProgrammeModel } from '../models/Programme.js';

export const getAll = async (req, res) => {
  try {
    const { enseignant_id, classe_id, annee_academique_id } = req.query;
    const filters = {};
    if (enseignant_id) filters.enseignant_id = enseignant_id;
    if (classe_id) filters.classe_id = classe_id;
    if (annee_academique_id) filters.annee_academique_id = annee_academique_id;

    const data = await ProgrammeModel.findAll(filters);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await ProgrammeModel.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Programme non trouvé' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await ProgrammeModel.create(req.body);
    res.status(201).json({ success: true, data, message: 'Programme créé avec succès' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Référence invalide' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await ProgrammeModel.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Programme non trouvé' });
    res.json({ success: true, data, message: 'Programme mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await ProgrammeModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Programme non trouvé' });
    res.json({ success: true, message: 'Programme supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};