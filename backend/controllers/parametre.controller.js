import { ProgrammeModel } from '../models/Programme.js';
import { crudController } from './crud.factory.js';
export const { getAll, getById, create, update, remove } = crudController(ProgrammeModel, 'Programme');