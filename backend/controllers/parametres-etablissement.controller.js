import { ParametresEtablissementModel } from '../models/ParametresEtablissement.js';

export const get = async (req, res) => {
  try {
    const data = await ParametresEtablissementModel.find();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const existing = await ParametresEtablissementModel.find();
    if (!existing) return res.status(404).json({ success: false, message: 'Paramètres non trouvés' });
    const data = await ParametresEtablissementModel.update(existing.id, req.body);
    res.json({ success: true, data, message: 'Paramètres mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};