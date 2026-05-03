import express from 'express';
import multer from 'multer';
import pool from '../config/db.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else { cb(new Error('Seuls les fichiers Excel sont acceptés')); }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/enseignants', upload.single('fichier'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ succes: false, message: 'Fichier requis' });
    res.json({ succes: true, donnees: { message: 'Import des enseignants en cours', fichier: req.file.originalname } });
  } catch (error) { res.status(500).json({ succes: false, message: 'Erreur serveur' }); }
});

router.post('/seances', upload.single('fichier'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ succes: false, message: 'Fichier requis' });
    res.json({ succes: true, donnees: { message: 'Import des séances en cours', fichier: req.file.originalname } });
  } catch (error) { res.status(500).json({ succes: false, message: 'Erreur serveur' }); }
});

export default router;