import { EquivalenceModel } from '../models/Equivalence.js';
import { crudController } from './crud.factory.js';
export const { getAll, getById, create, update, remove } = crudController(EquivalenceModel, 'Équivalence');