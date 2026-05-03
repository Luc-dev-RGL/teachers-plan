import multer from 'multer';
import path from 'path';

const stockage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const nomFichier = `${Date.now()}-${file.originalname}`;
    cb(null, nomFichier);
  },
});

const filtres = {
  fileFilter: (req, file, cb) => {
    const typesAutorises = /jpeg|jpg|png|gif|csv|xlsx|pdf/;
    const extension = typesAutorises.test(path.extname(file.originalname).toLowerCase());
    const mime = typesAutorises.test(file.mimetype);
    if (extension && mime) return cb(null, true);
    cb(new Error('Type de fichier non autorisé'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5Mo
};

export const upload = multer({ storage: stockage, fileFilter: filtres.fileFilter, limits: filtres.limits });