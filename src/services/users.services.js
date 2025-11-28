import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import logger from '#config/logger.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  } catch (error) {
    logger.error('failed to get all users', error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    return user;
  } catch (error) {
    if (error.message.includes('not found')) {
      logger.warn(`User with ID ${id} not found`);
      throw error;
    }
    logger.error(`Failed to get user with ID ${id}`, error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // Check if user exists (will throw error if not found)
    await getUserById(id);

    // Prepare update data
    const updateData = { ...updates };

    // Update the updatedAt timestamp
    updateData.updatedAt = new Date();

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    logger.info(`User with ID ${id} updated successfully`);
    return updatedUser;
  } catch (error) {
    if (error.message.includes('not found')) {
      logger.warn(`Cannot update: User with ID ${id} not found`);
      throw error;
    }
    if (
      error.message.includes('duplicate key') ||
      error.message.includes('unique constraint')
    ) {
      logger.error(
        `Failed to update user with ID ${id}: Email already exists`,
        error
      );
      throw new Error('Email already exists');
    }
    logger.error(`Failed to update user with ID ${id}`, error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    // Check if user exists (will throw error if not found)
    await getUserById(id);

    await db.delete(users).where(eq(users.id, id));

    logger.info(`User with ID ${id} deleted successfully`);
    return { message: `User with ID ${id} deleted successfully` };
  } catch (error) {
    if (error.message.includes('not found')) {
      logger.warn(`Cannot delete: User with ID ${id} not found`);
      throw error;
    }
    logger.error(`Failed to delete user with ID ${id}`, error);
    throw error;
  }
};
