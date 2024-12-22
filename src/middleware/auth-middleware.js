import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Custom error for authentication failures
class AuthError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = 'AuthError';
        this.statusCode = statusCode;
    }
}

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new AuthError(401, 'No token provided');
        }

        const token = authHeader.split(' ')[1];

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error instanceof AuthError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to check if user has required permission
export const hasPermission = (permissionCode) => {
    return async (req, res, next) => {
        try {
            if (!req.user?.userId) {
                throw new AuthError(401, 'User not authenticated');
            }

            const user = await prisma.user.findUnique({
                where: { ulid: req.user.userId },
                include: {
                    role: {
                        include: {
                            permissions: true
                        }
                    }
                }
            });

            if (!user) {
                throw new AuthError(404, 'User not found');
            }

            const hasRequiredPermission = user.role.permissions.some(
                p => p.code === permissionCode
            );

            if (!hasRequiredPermission) {
                throw new AuthError(403, 'Permission denied');
            }

            next();
        } catch (error) {
            if (error instanceof AuthError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};