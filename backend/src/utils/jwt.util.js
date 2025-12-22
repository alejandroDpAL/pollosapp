import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: './src/env/.env' });

const AUTH_SECRET = process.env.AUTH_SECRET || 'esunsecretoentumirada';
const AUTH_EXPIRE = process.env.AUTH_EXPIRE || '20h';

/**
 * Genera un token JWT para el usuario
 * @param {Object} payload - Datos del usuario a incluir en el token
 * @returns {string} Token JWT
 */
export const generateToken = (payload) => {
    try {
        const token = jwt.sign(
            {
                id: payload.id,
                correo: payload.correo,
            },
            AUTH_SECRET,
            {
                expiresIn: AUTH_EXPIRE,
                issuer: 'pollosapp'
            }
        );
        return token;
    } catch (error) {
        throw new Error('Error al generar token');
    }
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Datos decodificados del token
 */
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, AUTH_SECRET);
        return decoded;
    } catch (error) {
        throw error;
    }
};

/**
 * Genera un token de refresh (duración más larga)
 * @param {Object} payload - Datos del usuario
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
    try {
        const refreshToken = jwt.sign(
            {
                id: payload.id,
                type: 'refresh'
            },
            AUTH_SECRET,
            {
                expiresIn: '7d',
                issuer: 'pollosapp'
            }
        );
        return refreshToken;
    } catch (error) {
        throw new Error('Error al generar refresh token');
    }
};
