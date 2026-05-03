import { AnneeAcademiqueModel } from '../models/AnneeAcademique.js';
import { crudController } from './crud.factory.js';

const { create, update, remove, getAll, getById } = crudController(AnneeAcademiqueModel, 'Année académique');
export { create, update, remove, getAll, getById };

export const getCurrent = async (req, res) => {
  try {
    const data = await AnneeAcademiqueModel.getCurrent();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};