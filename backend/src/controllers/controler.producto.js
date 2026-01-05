import { pool } from "../database/conexion.js";

export const listarProductos = async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM productos");
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al listar productos:", error);
    return res.status(500).json({
      message: "ERROR DEL SERVIDOR: " + error.message,
    });
  }
};

/**
 * NUEVA FUNCIÓN: Obtener lotes con trazabilidad completa
 * Solo retorna lotes del negocio activo del usuario
 */
export const get_lotesByNegocio = async (req, res) => {
  const { negocio_id } = req.params;
  const usuario_id = req.user?.id; // Del token JWT

  try {
    // Validar que el negocio existe y pertenece al usuario
    const [negocioCheck] = await pool.query(
      `SELECT id FROM negocio WHERE id = ? AND usuario_id = ?`,
      [negocio_id, usuario_id]
    );

    if (negocioCheck.length === 0) {
      return res.status(403).json({
        message: "No tienes acceso a este negocio."
      });
    }

    // Obtener lotes SOLO del negocio especificado
    const sql = `
      SELECT 
        l.id,
        l.nombre,
        l.producto_id,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.precio,
        l.fecha,
        l.descripcion,
        l.fecha_actualizacion,
        
        p.id AS producto_id,
        p.nombre AS producto_nombre,
        
        n.id AS negocio_id,
        n.nombre AS negocio_nombre
      FROM lotes l
      INNER JOIN productos p ON l.producto_id = p.id
      INNER JOIN negocio n ON p.negocio_id = n.id
      WHERE n.id = ? AND n.usuario_id = ?
      ORDER BY l.fecha DESC
    `;
    
    const [rows] = await pool.query(sql, [negocio_id, usuario_id]);


    return res.status(200).json({
      message: "Lotes obtenidos correctamente.",
      total: rows.length,
      negocio_id: negocio_id,
      data: rows
    });

  } catch (error) {
    console.error("Error al obtener lotes por negocio:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};

/**
 * MANTENER: Esta función para compatibilidad, pero ahora retorna
 * lotes ya filtrados por negocio via negocio_id
 */
export const get_lotesByUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const sql = `
      SELECT 
        l.id,
        l.nombre,
        l.producto_id,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.precio,
        l.fecha,
        l.descripcion,
        p.nombre AS producto_nombre,
        n.id AS negocio_id,
        n.nombre AS negocio_nombre
      FROM lotes l
      INNER JOIN productos p ON l.producto_id = p.id
      INNER JOIN negocio n ON p.negocio_id = n.id
      WHERE n.usuario_id = ?
      ORDER BY n.id, l.fecha DESC
    `;
    
    const [rows] = await pool.query(sql, [usuario_id]);

    return res.status(200).json(rows);

  } catch (error) {
    console.error("Error al obtener lotes por usuario:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
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

    const sql = "INSERT INTO productos (nombre, negocio_id) VALUES (?, ?)";

    const [rows] = await pool.query(sql, [nombre, negocio_id]);

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
  const { nombre, negocio_id } = req.body;

  try {
    if (!nombre || !negocio_id) {
      return res.status(400).json({
        message: "Los campos nombre y negocio_id son obligatorios."
      });
    }

    const sql = "UPDATE productos SET nombre = ?, negocio_id = ? WHERE id = ?";

    const [result] = await pool.query(sql, [
      nombre,
      negocio_id,
      id,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Producto actualizado con éxito." });
    } else {
      res.status(404).json({ message: "No se encontró el producto para actualizar." });
    }
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      message: "Error al conectarse con el servidor: " + error.message,
    });
  }
};


export const EliminarProductos = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM productos WHERE id = ?", [id]);

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

    const [rows] = await pool.query(
      "SELECT * FROM productos WHERE negocio_id = ? ORDER BY nombre ASC",
      [negocio_id]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error("Error al obtener productos por negocio:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};
