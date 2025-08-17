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

    const [rows] = await pool.query(sql, [identificacion, nombre_usuario, correo, hashedPassword,]);

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

