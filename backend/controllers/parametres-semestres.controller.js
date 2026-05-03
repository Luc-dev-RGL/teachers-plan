import { ParametresSemestresModel } from '../models/ParametresSemestres.js';
import { crudController } from './crud.factory.js';
export const { getAll, create, update, remove } = crudController(ParametresSemestresModel, 'Semestre');