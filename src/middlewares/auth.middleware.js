import logger from '#config/logger.js';
import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

/**
 * Authentication middleware
 * Extracts JWT token from cookies, verifies it, and attaches user to req.user
 * Returns 401 if authentication fails
 */
export const authenticate = (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');

    if (!token) {
      logger.warn('Authentication failed: No token provided', {
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Verify and decode the token
    const decoded = jwtToken.verify(token);

    // Attach user information to request object
    // This allows subsequent middlewares and controllers to access req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    logger.debug(`User ${req.user.id} authenticated successfully`);
    next();
  } catch (error) {
    logger.warn('Authentication failed: Invalid or expired token', {
      ip: req.ip,
      path: req.path,
      error: error.message,
    });
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

