/**
 * Factory pour générer un contrôleur CRUD standard
 * Utilisée par la majorité des contrôleurs pour éviter la répétition
 */
export const crudController = (model, modelName) => ({
  getAll: async (req, res) => {
    try {
      const data = await model.findAll();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const data = await model.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: `${modelName} non trouvé` });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const data = await model.create(req.body);
      res.status(201).json({ success: true, data, message: `${modelName} créé avec succès` });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: 'Enregistrement dupliqué' });
      if (error.code === '23503') return res.status(400).json({ success: false, message: 'Référence invalide' });
      res.status(500).json({ success: false, message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const data = await model.update(req.params.id, req.body);
      if (!data) return res.status(404).json({ success: false, message: `${modelName} non trouvé` });
      res.json({ success: true, data, message: `${modelName} mis à jour` });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: 'Enregistrement dupliqué' });
      res.status(500).json({ success: false, message: error.message });
    }
  },
  remove: async (req, res) => {
    try {
      const deleted = await model.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: `${modelName} non trouvé` });
      res.json({ success: true, message: `${modelName} supprimé` });
    } catch (error) {
      if (error.code === '23503') return res.status(400).json({ success: false, message: 'Impossible de supprimer: référencé ailleurs' });
      res.status(500).json({ success: false, message: error.message });
    }
  }
});