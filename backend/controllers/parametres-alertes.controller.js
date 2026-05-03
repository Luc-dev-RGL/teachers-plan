import { ParametresAlertesModel } from '../models/ParametresAlertes.js';
import { crudController } from './crud.factory.js';
export const { getAll, create, update, remove } = crudController(ParametresAlertesModel, 'Alerte');