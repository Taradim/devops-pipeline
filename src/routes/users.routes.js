import express from 'express';
import {
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import { authenticate } from '#middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', fetchAllUsers);
router.get('/:id', getUserById);
// Apply authentication middleware to routes that modify data
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
