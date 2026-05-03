import { ParametresNiveauxModel } from '../models/ParametresNiveaux.js';
import { crudController } from './crud.factory.js';
export const { getAll, create, update, remove } = crudController(ParametresNiveauxModel, 'Paramètres niveau');