import { SalleModel } from '../models/Salle.js';
import { crudController } from './crud.factory.js';
export const { getAll, getById, create, update, remove } = crudController(SalleModel, 'Salle');