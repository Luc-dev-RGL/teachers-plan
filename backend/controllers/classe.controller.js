import { ClasseModel } from '../models/Classe.js';
import { crudController } from './crud.factory.js';
export const { getAll, getById, create, update, remove } = crudController(ClasseModel, 'Classe');