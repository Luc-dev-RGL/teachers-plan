import { HeuresEffectueesModel } from '../models/HeuresEffectuees.js';
import { crudController } from './crud.factory.js';

const { getAll, getById, update, remove } = crudController(HeuresEffectueesModel, 'Heures effectuées');
export { getAll, getById, update, remove };

export const create = async (req, res) => {
  try {
    const data = await HeuresEffectueesModel.create({
      ...req.body,
      saisie_par: req.utilisateur?.id || null
    });
    res.status(201).json({ success: true, data, message: 'Heures enregistrées' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};