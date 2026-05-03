import { FiliereModel } from '../models/Filiere.js';
import { crudController } from './crud.factory.js';
export const { getAll, getById, create, update, remove } = crudController(FiliereModel, 'Filière');