import { pool } from "../database/conexion.js";
import bcrypt from "bcryptjs";

// Configuración
const SALT_ROUNDS = 10;
const LOGIN_DELAY_MS = 500;

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

        // 6. Login exitoso
        return res.status(200).json({
            message: "Autenticación exitosa",
            user: { id: usuario.id },
        });

    } catch (error) {
        console.error("Error en login:", error.message);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
