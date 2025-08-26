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

export const CrearUsuarios = async (req, res) => {
  const { nombre, identificacion, telefono, correo, password, cargo, estado } = req.body;

  try {
    // Validar campos obligatorios
    if (!nombre || !identificacion || !correo || !password) {
      return res.status(400).json({
        message: "Los campos 'nombre', 'identificacion', 'correo' y 'password' son obligatorios."
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO usuarios (nombre, identificacion, telefono, correo, password, cargo, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      nombre,
      identificacion,
      telefono || null,
      correo,
      hashedPassword,
      cargo || null,
      estado || "activo"
    ]);

    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: "Usuario registrado con éxito.",
        id: result.insertId
      });
    }

    return res.status(400).json({
      message: "No se pudo registrar el usuario, intente nuevamente."
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};

export const ActualizarUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  const { identificacion, nombre_usuario, correo, password } = req.body;

  try {
    // Validar ID
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ message: 'El ID del usuario es requerido y debe ser válido.' });
    }
    // Validar campos obligatorios dinámicamente
    // const camposObligatorios = { identificacion, nombre_usuario, correo };
    // const faltantes = Object.entries(camposObligatorios)
    //   .filter(([_, valor]) => !valor || valor.toString().trim() === '')
    //   .map(([campo]) => campo);

    // if (faltantes.length > 0) {
    //   return res.status(400).json({
    //     message: `Faltan los siguientes campos obligatorios: ${faltantes.join(', ')}`
    //   });
    // }




    // Validar correo con regex
    const Validate_Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!Validate_Email.test(correo)) {
      return res.status(400).json({ message: 'El correo no es válido.' });
    }

    //  Valida que los datos sean iguales
    const [existe] = await pool.query(
      'SELECT id FROM usuario WHERE (identificacion = ? OR correo = ?) AND id <> ?',
      [identificacion, correo, id_usuario]
    );
    if (existe.length > 0) {
      return res.status(409).json({
        message: 'Ya existe un usuario con esa identificación o correo.'
      });
    }


    let sql = `
      UPDATE usuario 
      SET identificacion = ?, nombre_usuario = ?, correo = ?
    `;
    const params = [identificacion, nombre_usuario, correo];

    // Si se envió password, validamos y lo actualizamos
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          message: 'La contraseña debe tener al menos 6 caracteres.'
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      sql += `, password = ?`;
      params.push(hashedPassword);
    }

    sql += ` WHERE id = ?`;
    params.push(id_usuario);

    //  consulta
    const [result] = await pool.query(sql, params);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Usuario actualizado con éxito.' });
    } else {
      res.status(404).json({ message: 'No se encontró el usuario para actualizar.' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el usuario: ' + error.message,
    });
  }
};

