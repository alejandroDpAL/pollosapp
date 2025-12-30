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
  const { nombre, negocio_id } = req.body;

  try {
    // Validar campos obligatorios
    const camposObligatorios = { nombre, negocio_id };
    const faltantes = Object.entries(camposObligatorios)
      .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === "")
      .map(([campo]) => campo);

    if (faltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`
      });
    }

    const sql = `
      INSERT INTO productos (nombre, negocio_id) 
      VALUES (?, ?)
    `;

    const [rows] = await pool.query(sql, [
      nombre,
      negocio_id
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
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!nombre) {
      return res.status(400).json({
        message: "El nombre es obligatorio."
      });
    }

    const sql = `
      UPDATE productos
      SET nombre = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      nombre,
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
    const { id } = req.params;

    let sql = "DELETE FROM productos WHERE id = ?";

    const [result] = await pool.query(sql, [id]);

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



export const listarProductosPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    if (!usuario_id) {
      return res.status(400).json({
        message: "El ID del usuario es obligatorio."
      });
    }

    // Consulta: productos de los negocios pertenecientes al usuario
    const sql = `
      SELECT p.*
      FROM productos p
      INNER JOIN negocio n ON p.negocio_id = n.id
      WHERE n.usuario_id = ?
    `;

    const [rows] = await pool.query(sql, [usuario_id]);

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({
        message: "No se encontraron productos para este usuario."
      });
    }

  } catch (error) {
    console.error("Error al obtener productos por usuario:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};

export const listarProductosPorNegocio = async (req, res) => {
  const { negocio_id } = req.params;

  try {
    if (!negocio_id) {
      return res.status(400).json({
        message: "El ID del negocio es obligatorio."
      });
    }

    const sql = `
      SELECT * FROM productos
      WHERE negocio_id = ?
      ORDER BY nombre ASC
    `;

    const [rows] = await pool.query(sql, [negocio_id]);

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({
        message: "No se encontraron productos para este negocio."
      });
    }

  } catch (error) {
    console.error("Error al obtener productos por negocio:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};
