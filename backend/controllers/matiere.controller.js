import { MatiereModel } from '../models/Matiere.js';
import { crudController } from './crud.factory.js';
export const { getAll, getById, create, update, remove } = crudController(MatiereModel, 'Matière');