import { pool } from "../database/conexion.js";

export const listarClientes = async (req, res) => {
  try {
    let sql =
      `SELECT 
      clientes.nombre, 
      productos.nombre_producto AS producto, 
      clientes.cantidad, 
      clientes.valor_compra
       FROM clientes INNER JOIN productos ON clientes.producto = productos.id_producto`;

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
  const { nombre, producto, cantidad, valor_compra } = req.body;

  try {
    let sql =
      "INSERT INTO clientes (nombre, producto, cantidad, valor_compra) values (?,?,?,?)";

    const [rows] = await pool.query(sql, [
      nombre,
      producto,
      cantidad,
      valor_compra,
    ]);

    if (rows.affectedRows > 0) {
      res.status(200).json({
        message: "Cliente registrado con exito.",
      });
    } else {
      res.status(403).json({
        message: "No se logro registrar el Cliente intente nuevamente.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al conectarse con el servidor." + error,
    });
  }
};

export const ActualizarCliente = async (req, res) => {
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

export const EliminarCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;

    let sql = "DELETE FROM clientes WHERE id_cliente = ?";

    const [result] = await pool.query(sql, [id_cliente]);

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
