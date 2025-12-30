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
  const { usuario_id, negocio_id, nombre, telefono, correo, direccion, estado } = req.body;

  try {
  
    if (!negocio_id) {
      return res.status(400).json({
        message: "El negocio_id es obligatorio."
      });
    }

    if (!nombre) {
      return res.status(400).json({
        message: "El nombre es obligatorio."
      });
    }

    const sql = `
      INSERT INTO clientes (usuario_id, negocio_id, nombre, telefono, correo, direccion, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [rows] = await pool.query(sql, [
      usuario_id || null,
      negocio_id,
      nombre,
      telefono || null,
      correo || null,
      direccion || null,
      estado ?? 1, 
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
  const { usuario_id, negocio_id, nombre, telefono, correo, direccion, estado } = req.body;

  try {
    let sql = `
      UPDATE clientes
      SET usuario_id = ?, negocio_id = ?, nombre = ?, telefono = ?, correo = ?, direccion = ?, estado = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      usuario_id || null,
      negocio_id || null,
      nombre,
      telefono || null,
      correo || null,
      direccion || null,
      estado ?? 1,
      id
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Cliente actualizado con éxito." });
    } else {
      res.status(404).json({ success: false, message: "No se encontró el cliente para actualizar." });
    }
  } catch (error) {
    console.error(" Error en ActualizarCliente:", error);
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


export const ObtenerComprasDeCliente = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "Se requiere el ID del cliente." });
    }

    //  Obtener  información de compras
    const sqlCompras = `
      SELECT 
        v.id AS venta_id,
        v.cantidad,
        v.precio_unitario,
        v.valor_total,
        v.fecha,

        p.id AS producto_id,
        p.nombre AS producto_nombre,
        p.costo AS producto_costo,

        l.id AS lote_id,
        l.nombre AS lote_nombre,
        l.precio AS lote_precio,

        u.id AS usuario_id,
        u.nombre AS usuario_nombre
      FROM ventas v
      LEFT JOIN productos p ON v.producto_id = p.id
      LEFT JOIN lotes l ON v.lote_id = l.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.cliente_id = ?
      ORDER BY v.fecha DESC
    `;

    const [compras] = await pool.query(sqlCompras, [id]);

    if (compras.length === 0) {
      return res.status(200).json({
        message: "El cliente no tiene compras registradas.",
        total_gastado: 0,
        cantidad_compras: 0,
        compras: []
      });
    }


    const totalGastado = compras.reduce((sum, compra) => {
      return sum + Number(compra.valor_total);
    }, 0);


    const cantidadCompras = compras.length;

    res.status(200).json({
      message: "Historial de compras obtenido correctamente.",
      total_gastado: totalGastado,
      cantidad_compras: cantidadCompras,
      compras: compras
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error del servidor.",
      error: error.message
    });
  }
};
