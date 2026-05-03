import { EnseignantModel } from '../models/Enseignant.js';
import { crudController } from './crud.factory.js';
import { UtilisateurModel } from '../models/Utilisateur.js';
import bcrypt from 'bcryptjs';

const { getAll, getById, update, remove } = crudController(EnseignantModel, 'Enseignant');

export { getAll, getById, update, remove };

export const create = async (req, res) => {
  try {
    const { password, ...data } = req.body;

    // Convertir departement_id en entier ou null (le select HTML envoie une string)
    if (data.departement_id !== undefined && data.departement_id !== '') {
      data.departement_id = parseInt(data.departement_id, 10);
    } else {
      data.departement_id = null;
    }

    // Si on a un email et un mot de passe, on crée d'abord l'utilisateur
    if (data.email && password) {
      const hash = await bcrypt.hash(password, 10);
      const utilisateur = await UtilisateurModel.create({
        email: data.email,
        password_hash: hash,
        role: 'enseignant',
        actif: true
      });
      data.utilisateur_id = utilisateur.id;
    }

    // Générer un matricule si non fourni
    if (!data.matricule) {
      const count = await EnseignantModel.findAll();
      const num = String(count.length + 1).padStart(3, '0');
      data.matricule = `ENS-2025-${num}`;
    }

    // Déterminer la catégorie à partir du grade si non fournie
    if (!data.categorie && data.grade) {
      const gradesPermanent = ['Professeur', 'Maître de Conférences', 'Maître Assistant', 'Docteur', 'Attaché', 'Assistant'];
      data.categorie = gradesPermanent.includes(data.grade) ? 'Permanent' : 'Vacataire';
    }

    const enseignant = await EnseignantModel.create(data);
    res.status(201).json({ success: true, data: enseignant, message: 'Enseignant créé avec succès' });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'Matricule ou email déjà existant' });
    if (error.code === '23503') return res.status(400).json({ success: false, message: 'Référence invalide (vérifiez le département)' });
    res.status(500).json({ success: false, message: error.message });
  }
};
