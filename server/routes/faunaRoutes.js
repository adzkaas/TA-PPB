import express from 'express';
import { FaunaController } from '../controllers/faunaController.js';

const router = express.Router();

router.get('/', FaunaController.getAll);
router.post('/compare', FaunaController.compare);
router.get('/:id', FaunaController.getById);
router.post('/', FaunaController.create);
router.put('/:id', FaunaController.update);
router.patch('/:id', FaunaController.update);
router.delete('/:id', FaunaController.remove);

export default router;
