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
  const { nombre, negocio_id, cantidad, costo, fecha_compra, fecha_venta } = req.body;

  try {
    // Validar campos obligatorios
    const camposObligatorios = { nombre, negocio_id, cantidad, costo, fecha_compra, fecha_venta };
    const faltantes = Object.entries(camposObligatorios)
      .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === "")
      .map(([campo]) => campo);

    if (faltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`
      });
    }

    const sql = `
      INSERT INTO productos (nombre, negocio_id, cantidad, costo, fecha_compra, fecha_venta) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [rows] = await pool.query(sql, [
      nombre,
      negocio_id,
      cantidad,
      costo,
      fecha_compra,
      fecha_venta
    ]);

    if (rows.affectedRows > 0) {
      return res.status(201).json({
        message: "Producto registrado con éxito.",
        id: rows.insertId
      });
    }

    return res.status(400).json({
      message: "No se logró registrar el producto, intente nuevamente."
    });

  } catch (error) {
    console.error("Error al registrar producto:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};


export const ActualizarProducto = async (req, res) => {
  const { id } = req.params; // aquí usamos "id", que es la columna real en la tabla
  const { nombre, cantidad, costo, fecha_compra, fecha_venta } = req.body;

  try {
    const sql = `
      UPDATE productos
      SET nombre = ?, cantidad = ?, costo = ?, fecha_compra = ?, fecha_venta = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      nombre,
      cantidad,
      costo,
      fecha_compra,
      fecha_venta,
      id,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Producto actualizado con éxito." });
    } else {
      res.status(404).json({ message: "No se encontró el producto para actualizar." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al conectarse con el servidor: " + error.message,
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



