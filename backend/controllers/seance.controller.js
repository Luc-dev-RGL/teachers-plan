import { SeanceCoursModel } from '../models/SeanceCours.js';
import { crudController } from './crud.factory.js';

const { getAll, getById, update, remove } = crudController(SeanceCoursModel, 'Séance');
export { getAll, getById, update, remove };

export const create = async (req, res) => {
  try {
    if (req.body.salle_id && req.body.date_debut && req.body.date_fin) {
      const conflicts = await SeanceCoursModel.checkConflict(
        req.body.salle_id, req.body.date_debut, req.body.date_fin
      );
      if (conflicts.length > 0) {
        return res.status(409).json({ success: false, message: 'Conflit de planning', conflicts });
      }
    }
    const data = await SeanceCoursModel.create(req.body);
    res.status(201).json({ success: true, data, message: 'Séance créée' });
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ success: false, message: 'Référence invalide' });
    res.status(500).json({ success: false, message: error.message });
  }
};