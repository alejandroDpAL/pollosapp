import { pool } from "../database/conexion.js";

export const listarVentas = async (req, res) => {
  try {
    let sql =
      `SELECT * FROM ventas
      `;

    const [result] = await pool.query(sql);
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: "no se encontraron Ventas disponibles",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "ERROR DE PARTE DEL SERVIDOR" + error,
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
  const { id_cliente } = req.params;
  const { nombre, producto, cantidad, valor_compra } = req.body;

  try {
    const sql = `
      UPDATE clientes
      SET nombre = ?,producto = ?, cantidad = ?, valor_compra = ?
      WHERE id_cliente = ?
    `;

    const [result] = await pool.query(sql, [
      nombre,
      producto,
      cantidad,
      valor_compra,
      id_cliente,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Cliente actualizado con éxito." });
    } else {
      res
        .status(404)
        .json({ message: "No se encontró el cliente para actualizar." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al conectarse con el servidor: " + error.message,
    });
  }
};

export const EliminarVentas = async (req, res) => {
  try {
    const { id_venta  } = req.params;

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
