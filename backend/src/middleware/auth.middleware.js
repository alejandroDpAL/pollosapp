import { verifyAccessToken } from '../utils/jwt.util.js';

/**
 * Middleware para verificar ACCESS TOKENS
 * RECHAZA refresh tokens - solo acepta access tokens válidos
 */

export const verifyToken = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ 
                message: "Acceso denegado. Token no proporcionado",
                code: "NO_TOKEN"
            });
        }

        // Formato esperado: "Bearer TOKEN"
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        if (!token) {
            return res.status(401).json({ 
                message: "Token inválido",
                code: "INVALID_TOKEN"
            });
        }

        const decoded = verifyAccessToken(token);
        
        req.user = {
            id: decoded.id,
            correo: decoded.correo
        };

        next();
    } catch (error) {
        // Manejar errores específicos
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Access token expirado. Usa el refresh token para renovarlo.",
                code: "TOKEN_EXPIRED"
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: "Access token inválido",
                code: "INVALID_TOKEN"
            });
        }
        
        // Error si intentan usar un refresh token en rutas protegidas
        if (error.message === 'Token no es un access token') {
            return res.status(403).json({ 
                message: "No puedes usar un refresh token para acceder a esta ruta. Usa el access token.",
                code: "REFRESH_TOKEN_NOT_ALLOWED"
            });
        }
        
        return res.status(500).json({ 
            message: "Error al verificar token",
            code: "VERIFICATION_ERROR"
        });
    }
};

/**
 * Middleware opcional - permite acceso sin token pero lo valida si existe
 * Solo acepta access tokens válidos, ignora refresh tokens
 */

export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ') 
                ? authHeader.slice(7) 
                : authHeader;
            
            if (token) {
                try {
                    const decoded = verifyAccessToken(token);
                    req.user = {
                        id: decoded.id,
                        correo: decoded.correo
                    };
                } catch (error) {
                    // Ignorar errores de token inválido o expirado
                }
            }
        }
        
        next();
    } catch (error) {
        
        next();
    }
};
