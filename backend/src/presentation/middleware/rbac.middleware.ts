import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../../infrastructure/database/user.model';
import { VendorModel } from '../../infrastructure/database/vendor.model';

/**
 * Defines role-based access control permissions for various user roles.
 */
const rolePermissions = {
  user: ['/me', '/send-otp', '/verify-otp', '/refresh-token', '/google/callback', '/login'],
  admin: ['/admin/dashboard', '/admin/manage-users', '/admin/login'],
  theaterOwner: ['/theater/dashboard', '/theater/movies', '/theater/update'],
  eventOrganizer: ['/event/dashboard', '/event/tickets'],
};

/**
 * Middleware for Role-Based Access Control (RBAC).
 * Ensures that users/vendors can only access routes permitted for their role.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express function to proceed to the next middleware.
 * @returns {void} Responds with `403 Access denied` if user lacks permission.
 */
export const rbacMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // Extract user ID from authenticated request

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let role = '';

    // Check Users Collection (Admins & Normal Users)
    const user = await UserModel.findById(userId);
    if (user) {
      role = user.isAdmin ? 'admin' : 'user';
    }

    // Check Vendors Collection (Theater Owners & Event Organizers)
    const vendor = await VendorModel.findById(userId);
    if (vendor) {
      role = vendor.accountType === 'theater' ? 'theater' : 'event';
    }

    const allowedRoutes = rolePermissions[role] || [];
    if (!allowedRoutes.includes(req.path)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (error) {
    console.error('RBAC Middleware Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
