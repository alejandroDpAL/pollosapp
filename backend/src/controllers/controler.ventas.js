import { pool } from "../database/conexion.js";

export const listarVentas = async (req, res) => {
  try {
    let sql =
      `SELECT 
      ventas.id_venta,
      clientes.nombre AS Cliente,
      productos.nombre_producto AS Producto_comprado,
      ventas.cantidad ,
      ventas.valor_compra,
      ventas.estado_pago,
      DATE_FORMAT(ventas.fecha_venta, '%Y-%m-%d') AS fecha_venta

      FROM ventas
      INNER JOIN clientes ON ventas.id_cliente = clientes.id_cliente
      INNER JOIN productos ON ventas.id_producto = productos.id_producto
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
  const { id_cliente, id_producto, cantidad, valor_compra, estado_pago, fecha_venta } = req.body;

  try {
    // Verificar stock disponible
    const [producto] = await pool.query('SELECT cantidad_producto FROM productos WHERE id_producto = ?', [id_producto]);

    if (producto.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const stockActual = producto[0].cantidad_producto;

    if (stockActual < cantidad) {
      return res.status(400).json({ message: "No hay suficiente stock para realizar la venta" });
    }

    // Insertar la venta
    const sqlVenta = `
      INSERT INTO ventas (id_cliente, id_producto, cantidad, valor_compra, estado_pago, fecha_venta)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [ventaResult] = await pool.query(sqlVenta, [
      id_cliente,
      id_producto,
      cantidad,
      valor_compra,
      estado_pago,
      fecha_venta
    ]);

    // Actualizar stock
    const sqlUpdateStock = `
      UPDATE productos SET cantidad_producto = cantidad_producto - ?
      WHERE id_producto = ?
    `;
    await pool.query(sqlUpdateStock, [cantidad, id_producto]);

    res.status(200).json({
      message: "Venta registrada y stock actualizado correctamente"
    });

  } catch (error) {
    console.error("Error al registrar la venta:", error);
    res.status(500).json({
      message: "Error del servidor: " + error.message
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
