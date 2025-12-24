import { pool } from "../database/conexion.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.util.js";

// Configuración
const SALT_ROUNDS = 10;
const LOGIN_DELAY_MS = 500;

/**
 * Obtener información del cliente (IP y User-Agent)
 */
const getClientInfo = (req) => {
    return {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('user-agent') || 'unknown'
    };
};

/**
 * Calcular fecha de expiración del refresh token
 */
const calculateRefreshTokenExpiry = () => {
    const days = parseInt(process.env.REFRESH_TOKEN_EXPIRE) || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate;
};

export const AuthUserController = async (req, res) => {
    const { user, password } = req.body;

    try {
        // 1. Validar entradas
        if (!user?.trim() || !password?.trim()) {
            return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
        }

        // 2. Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user)) {
            return res.status(400).json({ message: "Formato de correo inválido" });
        }

        // 3. Buscar usuario solo por correo
        const [rows] = await pool.query(
            "SELECT id, correo, password FROM usuarios WHERE correo = ? LIMIT 1",
            [user]
        );

        // 4. Si no existe, simulamos una verificación de hash (anti timing)
        if (rows.length === 0) {
            await bcrypt.compare(password, await bcrypt.hash("fake_password", SALT_ROUNDS));
            await new Promise((r) => setTimeout(r, LOGIN_DELAY_MS));
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const usuario = rows[0];

        // 5. Verificar contraseña cifrada
        const isPasswordValid = await bcrypt.compare(password, usuario.password);

        if (!isPasswordValid) {
            await new Promise((r) => setTimeout(r, LOGIN_DELAY_MS));
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // 6. Login exitoso - Generar tokens JWT
        const accessToken = generateAccessToken({
            id: usuario.id,
            correo: usuario.correo
        });

        const refreshToken = generateRefreshToken({
            id: usuario.id
        });

        // 7. Guardar refresh token en la base de datos
        const clientInfo = getClientInfo(req);
        const expiresAt = calculateRefreshTokenExpiry();

        await pool.query(
            `INSERT INTO refresh_tokens 
            (usuario_id, token, expira_en, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?)`,
            [usuario.id, refreshToken, expiresAt, clientInfo.ip, clientInfo.userAgent]
        );

        return res.status(200).json({
            message: "Autenticación exitosa",
            accessToken,
            refreshToken,
            user: { 
                id: usuario.id,
                correo: usuario.correo
            },
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m'
        });

    } catch (error) {
        console.error("Error en login:", error.message);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

/**
 * Renovar access token usando refresh token
 * POST /auth/refresh
 */
export const RefreshTokenController = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        // 1. Validar que se envió el refresh token
        if (!refreshToken) {
            return res.status(400).json({ 
                message: "Refresh token requerido",
                code: "NO_REFRESH_TOKEN"
            });
        }

        // 2. Verificar que el refresh token es válido y no expiró
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: "Refresh token expirado. Debes hacer login nuevamente.",
                    code: "REFRESH_TOKEN_EXPIRED"
                });
            }
            return res.status(401).json({ 
                message: "Refresh token inválido",
                code: "INVALID_REFRESH_TOKEN"
            });
        }

        // 3. Verificar que el refresh token existe en la BD y no está revocado
        const [tokenRows] = await pool.query(
            `SELECT id, usuario_id, revocado, expira_en 
            FROM refresh_tokens 
            WHERE token = ? LIMIT 1`,
            [refreshToken]
        );

        if (tokenRows.length === 0) {
            return res.status(401).json({ 
                message: "Refresh token no encontrado",
                code: "REFRESH_TOKEN_NOT_FOUND"
            });
        }

        const tokenData = tokenRows[0];

        // 4. Verificar que no esté revocado
        if (tokenData.revocado) {
            return res.status(401).json({ 
                message: "Refresh token ha sido revocado. Debes hacer login nuevamente.",
                code: "REFRESH_TOKEN_REVOKED"
            });
        }

        // 5. Verificar que no haya expirado en BD
        if (new Date(tokenData.expira_en) < new Date()) {
            return res.status(401).json({ 
                message: "Refresh token expirado en base de datos",
                code: "REFRESH_TOKEN_EXPIRED_DB"
            });
        }

        // 6. Obtener datos del usuario
        const [userRows] = await pool.query(
            "SELECT id, correo FROM usuarios WHERE id = ? LIMIT 1",
            [tokenData.usuario_id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ 
                message: "Usuario no encontrado",
                code: "USER_NOT_FOUND"
            });
        }

        const usuario = userRows[0];

        // 7. Generar nuevo access token
        const newAccessToken = generateAccessToken({
            id: usuario.id,
            correo: usuario.correo
        });

        return res.status(200).json({
            message: "Access token renovado exitosamente",
            accessToken: newAccessToken,
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m'
        });

    } catch (error) {
        console.error("Error al renovar token:", error.message);
        return res.status(500).json({ 
            message: "Error interno del servidor",
            code: "INTERNAL_ERROR"
        });
    }
};

/**
 * Cerrar sesión (revocar refresh token)
 * POST /auth/logout
 */
export const LogoutController = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        // 1. Validar que se envió el refresh token
        if (!refreshToken) {
            return res.status(400).json({ 
                message: "Refresh token requerido",
                code: "NO_REFRESH_TOKEN"
            });
        }

        // 2. Revocar el refresh token en la base de datos
        const [result] = await pool.query(
            `UPDATE refresh_tokens 
            SET revocado = TRUE, revocado_en = NOW() 
            WHERE token = ? AND revocado = FALSE`,
            [refreshToken]
        );

        // Verificar si se actualizó algún registro
        if (result.affectedRows === 0) {
            // El token no existe o ya está revocado
            return res.status(200).json({ 
                message: "Sesión cerrada (token ya revocado o no encontrado)",
                code: "ALREADY_REVOKED"
            });
        }

        return res.status(200).json({
            message: "Sesión cerrada exitosamente",
            code: "LOGOUT_SUCCESS"
        });

    } catch (error) {
        console.error("Error en logout:", error.message);
        return res.status(500).json({ 
            message: "Error interno del servidor",
            code: "INTERNAL_ERROR"
        });
    }
};

/**
 * Cerrar todas las sesiones de un usuario (revocar todos sus refresh tokens)
 * POST /auth/logout-all
 * Requiere autenticación (access token)
 */
export const LogoutAllController = async (req, res) => {
    try {
        // El middleware verifyToken ya agregó req.user
        const usuarioId = req.user.id;

        // Revocar todos los refresh tokens activos del usuario
        const [result] = await pool.query(
            `UPDATE refresh_tokens 
            SET revocado = TRUE, revocado_en = NOW() 
            WHERE usuario_id = ? AND revocado = FALSE`,
            [usuarioId]
        );

        return res.status(200).json({
            message: `Se cerraron ${result.affectedRows} sesión(es) exitosamente`,
            sessionsRevoked: result.affectedRows,
            code: "LOGOUT_ALL_SUCCESS"
        });

    } catch (error) {
        console.error("Error en logout-all:", error.message);
        return res.status(500).json({ 
            message: "Error interno del servidor",
            code: "INTERNAL_ERROR"
        });
    }
};
