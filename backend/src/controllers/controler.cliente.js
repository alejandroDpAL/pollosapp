import { pool } from "../database/conexion.js";

export const listarClientes = async (req, res) => {
  try {
    let sql =
      `SELECT * FROM clientes`;

    const [result] = await pool.query(sql);
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: "no se encontraron Clientes disponibles",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "ERROR DE PARTE DEL SERVIDOR" + error,
    });
  }
};

export const CrearClientes = async (req, res) => {
  // obtenemos los datos enviados desde el frontend
  const { usuarioId, nombre, telefono, correo, direccion, estado } = req.body;

  try {
    const sql = `
      INSERT INTO clientes (usuario_id, nombre, telefono, correo, direccion, estado)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [rows] = await pool.query(sql, [
      usuarioId || null,
      nombre,
      telefono || null,
      correo || null,
      direccion || null,
      estado ?? 1, // si no se envía, se guarda como activo (1)
    ]);

    if (rows.affectedRows > 0) {
      res.status(200).json({
        message: "Cliente registrado con éxito.",
        id: rows.insertId,
      });
    } else {
      res.status(403).json({
        message: "No se logró registrar el cliente, intente nuevamente.",
      });
    }
  } catch (error) {
    console.error("Error al registrar cliente:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message,
    });
  }
};



export const ActualizarCliente = async (req, res) => {
  const { id } = req.params;
  let { usuario_id, nombre, telefono, correo, direccion, estado, fecha } = req.body;

  try {
    // Si viene fecha, la convertimos al formato MySQL
    if (fecha) {
      const date = new Date(fecha);
      fecha = date.toISOString().slice(0, 19).replace('T', ' '); 
    }

    let sql = `
      UPDATE clientes
      SET usuario_id = ?, nombre = ?, telefono = ?, correo = ?, direccion = ?, estado = ?
    `;
    const params = [usuario_id, nombre, telefono, correo, direccion, estado];

    if (fecha) {
      sql += `, fecha = ?`;
      params.push(fecha);
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    const [result] = await pool.query(sql, params);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Cliente actualizado con éxito." });
    } else {
      res.status(404).json({ success: false, message: "No se encontró el cliente para actualizar." });
    }
  } catch (error) {
    console.error("❌ Error en ActualizarCliente:", error);
    res.status(500).json({
      message: "Error al conectarse con el servidor: " + error.message,
    });
  }
};




export const EliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    let sql = "DELETE FROM clientes WHERE id = ?";

    const [result] = await pool.query(sql, [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Cliente eliminado con exito.",
      });
    } else {
      res.status(404).json({
        message: "no se encontraron clientes disponibles para eliminar",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "ERROR DE PARTE DEL SERVIDOR" + error,
    });
  }
};



export const GetClientesByIdUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario) {
      return res.status(400).json({ message: "El parámetro id_usuario es requerido" });
    }

    const sql = "SELECT * FROM clientes WHERE usuario_id = ?";
    const [rows] = await pool.query(sql, [id_usuario]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron clientes para este usuario" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener cliente por ID de usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};