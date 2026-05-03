import { TauxHoraireModel } from '../models/TauxHoraire.js';
import { crudController } from './crud.factory.js';

const { create, update, remove, getAll, getById } = crudController(TauxHoraireModel, 'Taux horaire');
export { create, update, remove, getAll, getById };

export const calculerMontant = async (req, res) => {
  try {
    const { enseignant_id, annee_academique_id } = req.query;
    if (!enseignant_id || !annee_academique_id) {
      return res.status(400).json({ success: false, message: 'enseignant_id et annee_academique_id requis' });
    }
    const data = await TauxHoraireModel.calculerMontant(enseignant_id, annee_academique_id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};