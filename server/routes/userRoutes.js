import express from 'express';
import { UserController } from '../controllers/userController.js';

const router = express.Router();

router.get('/', UserController.getAll);
router.post('/login', UserController.login);
router.post('/register', UserController.register);
router.get('/profile', UserController.getProfile);
router.get('/:id', UserController.getProfile);
router.put('/:id', UserController.updateProfile);
router.patch('/:id', UserController.updateProfile);

export default router;
