import { pool } from "../database/conexion.js";
import bcrypt from 'bcryptjs';

export const listarUsuarios = async (req, res) => {
  try {
    let sql = "SELECT * FROM usuarios";

    const [result] = await pool.query(sql);
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: "no se encontraron usuarios",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "ERROR DE PARTE DEL SERVIDOR" + error,
    });
  }
};

// Obtener perfil de un usuario por ID
export const PerfilUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    // Validar ID
    if (!id_usuario || isNaN(Number(id_usuario))) {
      return res.status(400).json({
        message: "El ID del usuario es requerido y debe ser un número válido.",
      });
    }

    // Consultar datos del usuario
    const sql = `
      SELECT 
        id, 
        nombre, 
        identificacion, 
        telefono, 
        correo, 
        cargo, 
        estado
      FROM usuarios 
      WHERE id = ?
    `;

    const [rows] = await pool.query(sql, [id_usuario]);

    // Validar existencia
    if (rows.length === 0) {
      return res.status(404).json({
        message: "No se encontró el usuario solicitado.",
      });
    }

    // Retornar datos
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil del usuario:", error);
    res.status(500).json({
      message: "Error interno del servidor al obtener el perfil.",
      error: error.message,
    });
  }
};


export const CrearUsuarios = async (req, res) => {
  const { nombre, identificacion, telefono, correo, password, cargo, estado } = req.body;
  const saltRounds = 10; // nivel de seguridad para hash bcrypt

  try {
    // 1️ Validar campos obligatorios
    if (!nombre?.trim() || !identificacion == null || isNaN(Number(identificacion)) || !correo?.trim() || !password?.trim()) {
      return res.status(400).json({
        message: "Los campos 'nombre', 'identificación', 'correo' y 'password' son obligatorios.",
      });
    }

    // 2️ Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ message: "Formato de correo electrónico inválido." });
    }

    // 3️ Verificar si el correo ya existe
    const [existingUser] = await pool.query(
      "SELECT id FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "El correo electrónico ya está registrado." });
    }

    // 4️ Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5️ Insertar nuevo usuario
    const sql = `
      INSERT INTO usuarios (nombre, identificacion, telefono, correo, password, cargo, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      nombre.trim(),
      identificacion,
      telefono?.trim() || null,
      correo.trim().toLowerCase(),
      hashedPassword,
      cargo?.trim() || null,
      estado?.trim() || "activo",
    ]);

    // 6️Confirmar inserción
    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: "Usuario registrado con éxito.",
        id: result.insertId,
      });
    }

    return res.status(400).json({ message: "No se pudo registrar el usuario, intente nuevamente." });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({
      message: "Error interno del servidor."+ error,
    });
  }
};

export const ActualizarUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  const { nombre, identificacion, telefono, correo, password, cargo, estado } = req.body;

  try {

    if (!id_usuario || isNaN(Number(id_usuario))) {
      return res.status(400).json({ message: "El identificador del usuario es requerido y debe ser un número válido." });
    }


    const [user] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [id_usuario]);
    if (user.length === 0) {
      return res.status(404).json({ message: "El usuario solicitado no existe en el sistema." });
    }


    let sql = "UPDATE usuarios SET ";
    const params = [];
    const updates = [];

    if (identificacion) {
      updates.push("identificacion = ?");
      params.push(identificacion);
    }

    if (nombre) {
      updates.push("nombre = ?");
      params.push(nombre);
    }

    if (telefono) {
      updates.push("telefono = ?");
      params.push(telefono);
    }

    if (correo) {

      const Validate_Email =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!Validate_Email.test(correo)) {
        return res.status(400).json({ message: "El correo electrónico proporcionado no tiene un formato válido." });
      }


      const [existeCorreo] = await pool.query(
        "SELECT id FROM usuarios WHERE correo = ? AND id <> ?",
        [correo, id_usuario]
      );
      if (existeCorreo.length > 0) {
        return res.status(409).json({ message: "El correo electrónico ya está registrado en otro usuario." });
      }

      updates.push("correo = ?");
      params.push(correo);
    }

    if (cargo) {
      updates.push("cargo = ?");
      params.push(cargo);
    }

    if (estado !== undefined) {
      updates.push("estado = ?");
      params.push(estado);
    }

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          message: "La contraseña debe tener al menos 6 caracteres.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push("password = ?");
      params.push(hashedPassword);
    }


    if (updates.length === 0) {
      return res.status(400).json({ message: "No se proporcionaron campos para actualizar." });
    }

    sql += updates.join(", ") + " WHERE id = ?";
    params.push(id_usuario);


    const [result] = await pool.query(sql, params);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "La información del usuario se actualizó correctamente." });
    } else {
      res.status(400).json({ message: "No se realizaron cambios en la información del usuario." });
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      message: "Ocurrió un error interno al actualizar el usuario. Intente nuevamente más tarde.",
      error: error.message,
    });
  }
};




