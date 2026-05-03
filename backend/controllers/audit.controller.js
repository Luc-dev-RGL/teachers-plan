import { JournalAuditModel } from '../models/JournalAudit.js';

export const getAll = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const data = await JournalAuditModel.findAll(limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};