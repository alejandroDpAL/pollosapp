import { pool } from "../database/conexion.js";

export const listarProductos = async (req, res) => {
  try {
    const sql = `SELECT * FROM productos`;
    const [rows] = await pool.query(sql);

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({
        message: "No se encontraron productos disponibles",
      });
    }

  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({
      message: "ERROR DEL SERVIDOR: " + error.message,
    });
  }
};




export const CrearProductos = async (req, res) => {
  const { nombre_producto, cantidad_producto, costo, fecha_compra, fecha_venta} = req.body;

  try {

    let sql =
      "INSERT INTO productos (nombre_producto, cantidad_producto, costo, fecha_compra, fecha_venta) values (?,?,?,?,?)";

    const [rows] = await pool.query(sql, [nombre_producto, cantidad_producto, costo, fecha_compra, fecha_venta]);

    if (rows.affectedRows > 0) {
      res.status(200).json({
        message: "Producto registrado con exito.",
      });
    } else {
      res.status(403).json({
        message: "No se logro registrar el producto intente nuevamente.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al conectarse con el servidor." + error,
    });
  }
};

export const ActualizarProducto = async (req, res) => {

  const { id_producto } = req.params;
  const { nombre_producto, cantidad_producto, costo, fecha_compra, fecha_venta} = req.body;

  try {

    const sql = `
      UPDATE productos
      SET nombre_producto = ?, cantidad_producto = ?, costo = ?, fecha_compra = ?, fecha_venta = ?
      WHERE id_producto = ?
    `;

    const [result] = await pool.query(sql, [nombre_producto, cantidad_producto, costo, fecha_compra, fecha_venta,id_producto]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Producto actualizado con éxito.' });
    } else {
      res.status(404).json({ message: 'No se encontró el producto para actualizar.' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error al conectarse con el servidor: ' + error.message,
    });
  }
};

export const EliminarProductos = async (req, res) => {
  try {
    const {id_producto} = req.params;

    let sql = "DELETE FROM productos WHERE id_producto = ?";

    const [result] = await pool.query(sql,[id_producto]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Producto eliminado con exito."
      });

    } else {
      res.status(404).json({
        message: "no se encontraron productos disponibles para eliminar",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "ERROR DE PARTE DEL SERVIDOR" + error,
    });
  }
};



