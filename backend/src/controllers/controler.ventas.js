import { pool } from "../database/conexion.js";

export const listarVentas = async (req, res) => {
  try {
    const sql = `
      SELECT 
        v.id,
        u.nombre AS nombre_usuario,
        c.nombre AS nombre_cliente,
        l.nombre AS nombre_lote,
        v.cantidad,
        v.precio_unitario,
        v.valor_total,
        v.fecha,
        v.observaciones
      FROM ventas v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      INNER JOIN clientes c ON v.cliente_id = c.id
      INNER JOIN lotes l ON v.lote_id = l.id
      ORDER BY v.fecha DESC;
    `;

    const [result] = await pool.query(sql);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: "No se encontraron ventas disponibles",
      });
    }
  } catch (error) {
    console.error("Error al listar ventas:", error);
    res.status(500).json({
      message: "Error de parte del servidor: " + error.message,
    });
  }
};

//Listar por usuario 
export const listarVentasPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    if (!usuario_id) {
      return res.status(400).json({
        message: "El ID del usuario es obligatorio."
      });
    }

    const sql = `
      SELECT 
        v.id,
        u.nombre AS nombre_usuario,
        c.nombre AS nombre_cliente,
        l.nombre AS nombre_lote,
        v.cantidad,
        v.precio_unitario,
        v.valor_total,
        v.fecha,
        v.observaciones
      FROM ventas v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      INNER JOIN clientes c ON v.cliente_id = c.id
      INNER JOIN lotes l ON v.lote_id = l.id
      WHERE v.usuario_id = ?
      ORDER BY v.fecha DESC;
    `;

    const [result] = await pool.query(sql, [usuario_id]);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: "No se encontraron ventas registradas por este usuario.",
      });
    }
  } catch (error) {
    console.error("Error al listar ventas por usuario:", error);
    res.status(500).json({
      message: "Error en el servidor: " + error.message,
    });
  }
};

//Listar por Cliente 
export const listarVentasPorCliente = async (req, res) => {
  const { cliente_id } = req.params;

  try {
    if (!cliente_id) {
      return res.status(400).json({
        message: "El ID del cliente es obligatorio."
      });
    }

    const sql = `
      SELECT 
        v.id,
        u.nombre AS nombre_usuario,
        c.nombre AS nombre_cliente,
        l.nombre AS nombre_lote,
        v.cantidad,
        v.precio_unitario,
        v.valor_total,
        v.fecha,
        v.observaciones
      FROM ventas v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      INNER JOIN clientes c ON v.cliente_id = c.id
      INNER JOIN lotes l ON v.lote_id = l.id
      WHERE v.cliente_id = ?
      ORDER BY v.fecha DESC;
    `;

    const [result] = await pool.query(sql, [cliente_id]);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: "Este cliente no tiene ventas registradas.",
      });
    }
  } catch (error) {
    console.error("Error al listar ventas por cliente:", error);
    res.status(500).json({
      message: "Error en el servidor: " + error.message,
    });
  }
};



export const CrearVentas = async (req, res) => {
  const { lote_id, cliente_id, usuario_id, cantidad, precio_unitario, fecha, observaciones } = req.body;

  try {
    // Validar campos obligatorios
    if (!lote_id || !cantidad || !precio_unitario || !fecha) {
      return res.status(400).json({
        message: "Los campos 'lote_id', 'cantidad', 'precio_unitario' y 'fecha' son obligatorios."
      });
    }

    // Verificar stock del lote
    const [lote] = await pool.query("SELECT cantidad_actual FROM lotes WHERE id = ?", [lote_id]);

    if (lote.length === 0) {
      return res.status(404).json({ message: "Lote no encontrado." });
    }

    const stockActual = lote[0].cantidad_actual;

    if (stockActual < cantidad) {
      return res.status(400).json({ message: "No hay suficiente stock en el lote." });
    }

    // Calcular valor total
    const valor_total = cantidad * precio_unitario;

    // Insertar venta
    const sqlVenta = `
      INSERT INTO ventas (lote_id, cliente_id, usuario_id, cantidad, precio_unitario, valor_total, fecha, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sqlVenta, [
      lote_id,
      cliente_id || null,
      usuario_id || null,
      cantidad,
      precio_unitario,
      valor_total,
      fecha,
      observaciones || null
    ]);

    // Actualizar stock del lote
    const sqlUpdateStock = `
      UPDATE lotes 
      SET cantidad_actual = cantidad_actual - ? 
      WHERE id = ?
    `;
    await pool.query(sqlUpdateStock, [cantidad, lote_id]);

    res.status(201).json({
      message: "Venta registrada y stock actualizado correctamente.",
      id: result.insertId,
      valor_total
    });

  } catch (error) {
    console.error("Error al registrar la venta:", error);
    res.status(500).json({
      message: "Error del servidor.",
      error: error.message
    });
  }
};

export const ActualizarVentas = async (req, res) => {
  const { id_venta } = req.params;
  const { lote_id, cliente_id, usuario_id, cantidad, precio_unitario, fecha, observaciones } = req.body;

  try {
    // Validar ID
    if (!id_venta || isNaN(Number(id_venta))) {
      return res.status(400).json({ message: "El ID de la venta es requerido y debe ser válido." });
    }

    const sql = `
      UPDATE ventas
      SET lote_id = ?, cliente_id = ?, usuario_id = ?, cantidad = ?, 
          precio_unitario = ?, fecha = ?, observaciones = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      lote_id,
      cliente_id,
      usuario_id,
      cantidad,
      precio_unitario,
      fecha,
      observaciones,
      id_venta,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "La venta fue actualizada correctamente." });
    } else {
      res.status(404).json({ message: "No se encontró la venta para actualizar." });
    }
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    res.status(500).json({
      message: "Ocurrió un error interno al actualizar la venta.",
      error: error.message,
    });
  }
};

export const EliminarVentas = async (req, res) => {
  try {
    const { id_venta } = req.params;

    let sql = "DELETE FROM ventas WHERE id_venta = ?";

    const [result] = await pool.query(sql, [id_venta]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Venta eliminado con exito.",
      });
    } else {
      res.status(404).json({
        message: "no se encontraron ventas disponibles para eliminar",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "ERROR DE PARTE DEL SERVIDOR" + error,
    });
  }
};


export const get_negocios_por_usuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    if (!usuario_id) {
      return res.status(400).json({
        message: "El ID del usuario es obligatorio."
      });
    }

    const sql = `
      SELECT *
      FROM negocio
      WHERE usuario_id = ?
    `;

    const [rows] = await pool.query(sql, [usuario_id]);

    if (rows.length > 0) {
      return res.status(200).json(rows);
    } else {
      return res.status(404).json({
        message: "No se encontraron negocios registrados para este usuario."
      });
    }
  } catch (error) {
    console.error("Error al obtener negocios por usuario:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};

