import { NiveauModel } from '../models/Niveau.js';
import { crudController } from './crud.factory.js';
export const { getAll, getById, create, update, remove } = crudController(NiveauModel, 'Niveau');