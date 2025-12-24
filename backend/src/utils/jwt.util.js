import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: './src/env/.env' });

// SECRETOS SEPARADOS PARA ACCESS Y REFRESH TOKENS
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || '15m';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error('❌ ERROR: ACCESS_TOKEN_SECRET y REFRESH_TOKEN_SECRET deben estar configurados en .env');
}

/**
 * Genera un ACCESS TOKEN (corta duración, para APIs)
 * @param {Object} payload - Datos del usuario a incluir en el token
 * @returns {string} Access Token JWT
 */
export const generateAccessToken = (payload) => {
    try {
        const token = jwt.sign(
            {
                id: payload.id,
                correo: payload.correo,
                type: 'access' // IMPORTANTE: Identifica que es un access token
            },
            ACCESS_TOKEN_SECRET,
            {
                expiresIn: ACCESS_TOKEN_EXPIRE,
                issuer: 'pollosapp',
                audience: 'pollosapp-api'
            }
        );
        return token;
    } catch (error) {
        throw new Error('Error al generar access token');
    }
};

/**
 * Genera un REFRESH TOKEN (larga duración, solo para renovación)
 * @param {Object} payload - Datos del usuario
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
    try {
        const refreshToken = jwt.sign(
            {
                id: payload.id,
                type: 'refresh' // IMPORTANTE: Identifica que es un refresh token
            },
            REFRESH_TOKEN_SECRET,
            {
                expiresIn: REFRESH_TOKEN_EXPIRE,
                issuer: 'pollosapp',
                audience: 'pollosapp-refresh'
            }
        );
        return refreshToken;
    } catch (error) {
        throw new Error('Error al generar refresh token');
    }
};

/**
 * Verifica un ACCESS TOKEN
 * @param {string} token - Token a verificar
 * @returns {Object} Datos decodificados del token
 * @throws {Error} Si el token es inválido o es un refresh token
 */
export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
            issuer: 'pollosapp',
            audience: 'pollosapp-api'
        });
        
        // CRÍTICO: Verificar que sea un access token
        if (decoded.type !== 'access') {
            throw new Error('Token no es un access token');
        }
        
        return decoded;
    } catch (error) {
        throw error;
    }
};

/**
 * Verifica un REFRESH TOKEN
 * @param {string} token - Token a verificar
 * @returns {Object} Datos decodificados del token
 * @throws {Error} Si el token es inválido o es un access token
 */
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
            issuer: 'pollosapp',
            audience: 'pollosapp-refresh'
        });
        
        // CRÍTICO: Verificar que sea un refresh token
        if (decoded.type !== 'refresh') {
            throw new Error('Token no es un refresh token');
        }
        
        return decoded;
    } catch (error) {
        throw error;
    }
};

// ============================================
// FUNCIONES LEGACY (DEPRECADAS)
// ============================================
// Mantener temporalmente para compatibilidad

/**
 * @deprecated Usar generateAccessToken en su lugar
 */
export const generateToken = (payload) => {
    console.warn('⚠️ DEPRECADO: Usa generateAccessToken en lugar de generateToken');
    return generateAccessToken(payload);
};

/**
 * @deprecated Usar verifyAccessToken en su lugar
 */
export const verifyToken = (token) => {
    console.warn('⚠️ DEPRECADO: Usa verifyAccessToken en lugar de verifyToken');
    return verifyAccessToken(token);
};
