import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: './src/env/.env' });

// SECRETOS SEPARADOS PARA ACCESS Y REFRESH TOKENS
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || '15m';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error(' ERROR: ACCESS_TOKEN_SECRET y REFRESH_TOKEN_SECRET deben estar configurados en .env');
}

export const generateAccessToken = (payload) => {
    try {
        const token = jwt.sign(
            {
                id: payload.id,
                correo: payload.correo,
                type: 'access' 
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



export const generateRefreshToken = (payload) => {
    try {
        const refreshToken = jwt.sign(
            {
                id: payload.id,
                type: 'refresh' 
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


export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
            issuer: 'pollosapp',
            audience: 'pollosapp-api'
        });
        
        if (decoded.type !== 'access') {
            throw new Error('Token no es un access token');
        }
        
        return decoded;
    } catch (error) {
        throw error;
    }
};


export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
            issuer: 'pollosapp',
            audience: 'pollosapp-refresh'
        });
        
       
        if (decoded.type !== 'refresh') {
            throw new Error('Token no es un refresh token');
        }
        
        return decoded;
    } catch (error) {
        throw error;
    }
};


export const generateToken = (payload) => {
    console.warn(' DEPRECADO: Usa generateAccessToken en lugar de generateToken');
    return generateAccessToken(payload);
};


export const verifyToken = (token) => {
    console.warn(' DEPRECADO: Usa verifyAccessToken en lugar de verifyToken');
    return verifyAccessToken(token);
};
