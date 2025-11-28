import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationErrors } from '#utils/format.js';
import { hashPassword } from '#services/auth.service.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting all users...');
    const allUsers = await getAllUsers();
    res.json({
      message: 'Users retrieved successfully',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    // Validate route parameter
    const paramValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;
    logger.info(`Getting user with ID ${id}...`);

    const user = await getUserByIdService(id);

    res.json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      logger.warn(`User with ID ${req.params.id} not found`);
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }
    logger.error('Failed to get user by ID', error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // Validate route parameter
    const paramValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    // Validate request body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(bodyValidation.error),
      });
    }

    const { id } = paramValidation.data;
    const updates = bodyValidation.data;

    // req.user is populated by the authenticate middleware
    // Authorization checks
    // Users can only update their own information, unless they are admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      logger.warn(
        `User ${req.user.id} attempted to update user ${id} without permission`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admin can change the role field
    if (updates.role && req.user.role !== 'admin') {
      logger.warn(
        `User ${req.user.id} attempted to change role without admin privileges`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can change user roles',
      });
    }

    // Hash password if provided
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    logger.info(`Updating user with ID ${id}...`);
    const updatedUser = await updateUserService(id, updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      logger.warn(`Cannot update: User with ID ${req.params.id} not found`);
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }
    if (error.message.includes('Email already exists')) {
      logger.warn('Email already exists for user update');
      return res.status(409).json({
        error: 'Conflict',
        message: error.message,
      });
    }
    logger.error('Failed to update user', error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Validate route parameter
    const paramValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;

    // req.user is populated by the authenticate middleware
    // Authorization checks
    // Users can only delete their own account, unless they are admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      logger.warn(
        `User ${req.user.id} attempted to delete user ${id} without permission`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    logger.info(`Deleting user with ID ${id}...`);
    const result = await deleteUserService(id);

    res.json({
      message: result.message,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      logger.warn(`Cannot delete: User with ID ${req.params.id} not found`);
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }
    logger.error('Failed to delete user', error);
    next(error);
  }
};
