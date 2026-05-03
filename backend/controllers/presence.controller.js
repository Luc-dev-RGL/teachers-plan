import { PresenceModel } from '../models/Presence.js';
import { crudController } from './crud.factory.js';
export const { getAll, getById, create, update, remove } = crudController(PresenceModel, 'Présence');