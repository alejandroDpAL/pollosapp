import { pool } from "../database/conexion.js";
import bcrypt from 'bcryptjs';

export const listarUsuarios = async (req, res) => {
  try {
    let sql = "SELECT * FROM usuario";

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
  const { identificacion, nombre_usuario, correo, password } = req.body;

  try {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let sql =
      "INSERT INTO usuario (identificacion, nombre_usuario, correo, password) values (?,?,?,?)";

    const [rows] = await pool.query(sql, [identificacion,nombre_usuario,correo,hashedPassword,]);

    if (rows.affectedRows > 0) {
      res.status(200).json({
        message: "Usuario registrado con exito.",
      });
    } else {
      res.status(403).json({
        message: "No se registro el usuario intente nuevamente.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al conectarse con el servidor." + error,
    });
  }
};

export const ActualizarUsuario = async (req, res) => {

  const { id_usuario } = req.params;
  const { identificacion, nombre_usuario, correo, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `
      UPDATE usuario 
      SET identificacion = ?, nombre_usuario = ?, correo = ?, password = ?
      WHERE id_usuario = ?
    `;

    const [result] = await pool.query(sql, [
      identificacion,
      nombre_usuario,
      correo,
      hashedPassword,
      id_usuario,
    ]);

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

