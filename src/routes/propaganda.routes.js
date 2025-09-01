import { Router } from 'express';
import multer from 'multer';
// Importe a nova função do controller
import { uploadPropaganda, getPropagandas,deletePropaganda } from '../controllers/propaganda.controller.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

// Rota de upload que já existia
router.post('/upload', upload.single('propagandaFile'), uploadPropaganda);

// ADICIONE ESTA NOVA ROTA
router.get('/', getPropagandas);
router.delete('/:id', deletePropaganda);

export default router;