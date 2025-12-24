import { verifyAccessToken } from '../utils/jwt.util.js';
import { pool } from '../database/conexion.js';

/**
 * Middleware para verificar ACCESS TOKENS
 * RECHAZA refresh tokens - solo acepta access tokens válidos
 * Verifica que el usuario tenga al menos una sesión activa (refresh token no revocado)
 */

export const verifyToken = async (req, res, next) => {
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
        
        // VALIDACIÓN CRÍTICA: Verificar que el token fue emitido después del último login
        // Esto invalida automáticamente todos los tokens anteriores cuando el usuario vuelve a hacer login
        const [userResult] = await pool.query(
            `SELECT ultimo_login FROM usuarios WHERE id = ? LIMIT 1`,
            [decoded.id]
        );

        if (userResult.length === 0) {
            return res.status(401).json({ 
                message: "Usuario no encontrado.",
                code: "USER_NOT_FOUND"
            });
        }

        const ultimoLogin = userResult[0].ultimo_login;
        const tokenIssuedAt = decoded.iat * 1000; // Convertir segundos a milisegundos
        
        // Si el token fue emitido antes del último login, está invalidado
        if (ultimoLogin && tokenIssuedAt < new Date(ultimoLogin).getTime()) {
            return res.status(401).json({ 
                message: "Token invalidado. Se detectó un nuevo inicio de sesión. Por favor, inicia sesión nuevamente.",
                code: "TOKEN_INVALIDATED"
            });
        }

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
