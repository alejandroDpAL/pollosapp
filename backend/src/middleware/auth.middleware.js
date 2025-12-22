import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: './src/env/.env' });

const AUTH_SECRET = process.env.AUTH_SECRET || 'esunsecretoentumirada';

/**
 * Middleware para verificar el token JWT
 */
export const verifyToken = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ 
                message: "Acceso denegado. Token no proporcionado" 
            });
        }

        // Formato esperado: "Bearer TOKEN"
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        if (!token) {
            return res.status(401).json({ 
                message: "Token inválido" 
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, AUTH_SECRET);
        
        // Agregar información del usuario al request
        req.user = {
            id: decoded.id,
            correo: decoded.correo
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Token expirado" 
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: "Token inválido" 
            });
        }
        return res.status(500).json({ 
            message: "Error al verificar token" 
        });
    }
};

/**
 * Middleware opcional - permite acceso sin token pero lo valida si existe
 */
export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ') 
                ? authHeader.slice(7) 
                : authHeader;
            
            if (token) {
                const decoded = jwt.verify(token, AUTH_SECRET);
                req.user = {
                    id: decoded.id,
                    correo: decoded.correo
                };
            }
        }
        
        next();
    } catch (error) {
        // Si hay error, simplemente continúa sin usuario
        next();
    }
};
