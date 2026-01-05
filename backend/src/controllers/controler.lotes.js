import { pool } from "../database/conexion.js";


export const get_lotes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM lotes");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener lotes:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};

/**
 * ⭐ NUEVA FUNCIÓN: Obtener lotes por negocio específico
 * Solo retorna lotes del negocio activo del usuario autenticado
 * Esto garantiza que cada usuario solo vea sus propios lotes
 */
export const get_lotesByNegocio = async (req, res) => {
  const { negocio_id } = req.params;
  const usuario_id = req.user?.id; // Del token JWT (middleware auth)

  try {

    // 1️⃣ VALIDACIÓN: Negocio existe y pertenece al usuario
    const [negocioCheck] = await pool.query(
      `SELECT id FROM negocio WHERE id = ? AND usuario_id = ?`,
      [negocio_id, usuario_id]
    );

    if (negocioCheck.length === 0) {
      return res.status(403).json({
        message: "No tienes acceso a este negocio."
      });
    }

    // 2️⃣ OBTENER LOTES: Solo del negocio especificado
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
        
        p.id AS producto_id_rel,
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

export const create_lote = async (req, res) => {
  const {
    producto_id,
    cantidad_inicial,
    cantidad_actual,
    precio,
    fecha,
    descripcion,
    nombre
  } = req.body;

  const usuario_id = req.user?.id; // Del token JWT

  try {

    // ============================================
    // 1️⃣ VALIDACIONES: Campos obligatorios
    // ============================================
    const camposObligatorios = {
      producto_id,
      cantidad_inicial,
      cantidad_actual,
      precio,
      fecha,
      nombre
    };

    const faltantes = Object.entries(camposObligatorios)
      .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === "")
      .map(([campo]) => campo);

    if (faltantes.length > 0) {
      return res.status(400).json({
        message: `Campos obligatorios faltantes: ${faltantes.join(", ")}`
      });
    }

    // ============================================
    // 2️⃣ VALIDAR: Cantidades válidas
    // ============================================
    const cantInicial = parseInt(cantidad_inicial);
    const cantActual = parseInt(cantidad_actual);
    const precioVal = parseFloat(precio);

    if (isNaN(cantInicial) || cantInicial <= 0) {
      return res.status(400).json({
        message: "La cantidad inicial debe ser mayor a 0"
      });
    }

    if (isNaN(cantActual) || cantActual <= 0) {
      return res.status(400).json({
        message: "La cantidad actual debe ser mayor a 0"
      });
    }

    if (cantActual > cantInicial) {
      return res.status(400).json({
        message: `La cantidad actual (${cantActual}) no puede ser mayor a la inicial (${cantInicial})`
      });
    }

    if (isNaN(precioVal) || precioVal <= 0) {
      return res.status(400).json({
        message: "El precio debe ser mayor a 0"
      });
    }

    // ============================================
    // 3️⃣ VALIDAR: Producto existe y pertenece al usuario (a través de negocio)
    // ============================================
    const [productCheck] = await pool.query(
      `SELECT p.id, p.nombre, p.negocio_id, n.nombre AS negocio_nombre
       FROM productos p 
       INNER JOIN negocio n ON p.negocio_id = n.id 
       WHERE p.id = ? AND n.usuario_id = ?`,
      [producto_id, usuario_id]
    );

    if (productCheck.length === 0) {
      return res.status(404).json({
        message: "El producto no existe o no tienes acceso a él"
      });
    }

    const nombreProducto = productCheck[0].nombre;
    const negocio_id = productCheck[0].negocio_id; // Obtener negocio_id del producto

    // ============================================
    // 4️⃣ VALIDAR: Nombre del lote válido
    // ============================================
    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({
        message: "El nombre del lote no puede estar vacío"
      });
    }

    // ============================================
    // 5️⃣ CONVERTIR: Fecha de ISO 8601 a DATE
    // ============================================
    const fechaDate = new Date(fecha).toISOString().split('T')[0];

    // ============================================
    // 6️⃣ INSERTAR: Lote (con negocio_id obtenido desde el producto)
    // ============================================
    const sql = `
      INSERT INTO lotes (producto_id, negocio_id, cantidad_inicial, cantidad_actual, precio, fecha, descripcion, nombre)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      producto_id,
      negocio_id,
      cantInicial,
      cantActual,
      precioVal,
      fechaDate,
      descripcion?.trim() || null,
      nombre.trim()
    ]);


    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: `Lote "${nombre.trim()}" registrado correctamente`,
        id: result.insertId,
        lote: {
          id: result.insertId,
          nombre: nombre.trim(),
          producto_id: producto_id,
          producto_nombre: nombreProducto,
          cantidad_inicial: cantInicial,
          cantidad_actual: cantActual,
          precio: precioVal,
          fecha: fecha
        }
      });
    } else {
      return res.status(400).json({
        message: "No se logró registrar el lote, intente nuevamente"
      });
    }
  } catch (error) {
    console.error("Error al crear lote:", error);
    return res.status(500).json({
      message: "Error en el servidor",
      error: error.message
    });
  }
};


export const update_lote = async (req, res) => {
  const { id } = req.params;
  const {
    producto_id,
    cantidad_inicial,
    cantidad_actual,
    precio,
    fecha,
    descripcion,
    nombre
  } = req.body;

  const usuario_id = req.user?.id;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: "El ID del lote es requerido y debe ser válido."
      });
    }

    // Validar campos obligatorios
    const camposObligatorios = {
      producto_id,
      cantidad_inicial,
      cantidad_actual,
      precio,
      fecha,
      nombre
    };

    const faltantes = Object.entries(camposObligatorios)
      .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === "")
      .map(([campo]) => campo);

    if (faltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`
      });
    }

    // Validar que el producto existe y pertenece al usuario (a través de negocio)
    const sqlValidateProduct = `
      SELECT p.id, n.usuario_id 
      FROM productos p
      INNER JOIN negocio n ON p.negocio_id = n.id
      WHERE p.id = ? AND n.usuario_id = ?
    `;
    const [productExists] = await pool.query(sqlValidateProduct, [producto_id, usuario_id]);

    if (productExists.length === 0) {
      return res.status(400).json({
        message: "El producto no existe o no tienes acceso a él."
      });
    }

    // ============================================
    // 4️⃣ CONVERTIR: Fecha de ISO 8601 a DATE
    // ============================================
    const fechaDate = new Date(fecha).toISOString().split('T')[0];

    const sql = `
      UPDATE lotes
      SET producto_id = ?, cantidad_inicial = ?, cantidad_actual = ?, precio = ?, fecha = ?, descripcion = ?, nombre = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      producto_id,
      cantidad_inicial,
      cantidad_actual,
      precio,
      fechaDate,
      descripcion,
      nombre,
      id
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Lote actualizado con éxito."
      });
    } else {
      res.status(404).json({
        message: "No se encontró el lote para actualizar."
      });
    }
  } catch (error) {
    console.error("Error al actualizar lote:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};


// Obtener lotes por usuario_id
export const get_lotesByUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // Validar parámetro
    if (!usuario_id || isNaN(usuario_id)) {
      return res.status(400).json({
        message: "El ID del usuario es requerido y debe ser válido."
      });
    }

    // Consulta optimizada usando negocio_id indirecto (a través de productos)
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
      ORDER BY l.fecha DESC
    `;
    
    const [rows] = await pool.query(sql, [usuario_id]);


    res.status(200).json(rows);

  } catch (error) {
    console.error("Error al obtener lotes por usuario:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};


export const ObtenerDetalleLote = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "Se requiere el ID del lote." });
    }

   
    const sqlLote = `
      SELECT
        l.id AS lote_id,
        l.nombre AS lote_nombre,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.precio,
        l.fecha,
        l.descripcion,

        p.id AS producto_id,
        p.nombre AS producto_nombre,

        n.id AS negocio_id,
        n.nombre AS negocio_nombre,
        n.usuario_id
      FROM lotes l
      INNER JOIN productos p ON l.producto_id = p.id
      INNER JOIN negocio n ON p.negocio_id = n.id
      WHERE l.id = ?
    `;

    const [lote] = await pool.query(sqlLote, [id]);

    if (lote.length === 0) {
      return res.status(404).json({ message: "Lote no encontrado." });
    }

    const loteData = lote[0];

    // Pérdidas asociadas
    const sqlPerdidas = `
      SELECT id, cantidad, motivo, descripcion, fecha_perdida
      FROM perdidas
      WHERE lote_id = ?
    `;
    const [perdidas] = await pool.query(sqlPerdidas, [id]);

    // 3. Costos asociados
    const sqlCostos = `
      SELECT id, nombre, valor, fecha_compra, observaciones
      FROM costos
      WHERE lote_id = ?
      ORDER BY fecha_compra DESC
    `;
    const [costos] = await pool.query(sqlCostos, [id]);

    //  Ventas asociadas
    const sqlVentas = `
      SELECT
        v.id AS venta_id,
        v.cantidad,
        v.precio_unitario,
        v.valor_total,
        v.fecha,

        c.id AS cliente_id,
        c.nombre AS cliente_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.lote_id = ?
      ORDER BY v.fecha DESC
    `;
    const [ventas] = await pool.query(sqlVentas, [id]);

    res.status(200).json({
      message: "Detalle del lote obtenido correctamente.",
      lote: loteData,
      perdidas,
      costos,
      ventas
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error del servidor.",
      error: error.message
    });
  }
};

export const ObtenerStockGeneral = async (req, res) => {
  try {
    const sql = `
      SELECT
        l.id AS lote_id,
        l.nombre AS lote_nombre,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.precio,
        l.fecha,

        p.id AS producto_id,
        p.nombre AS producto_nombre
      FROM lotes l
      LEFT JOIN productos p ON l.producto_id = p.id
      ORDER BY l.fecha DESC
    `;

    const [result] = await pool.query(sql);

    res.status(200).json({
      message: "Stock general obtenido correctamente.",
      total_lotes: result.length,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      message: "Error del servidor.",
      error: error.message
    });
  }
};

// Eliminar lote
export const delete_lote = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: "El ID del lote es requerido y debe ser válido."
      });
    }

    const sql = `DELETE FROM lotes WHERE id = ?`;
    const [result] = await pool.query(sql, [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Lote eliminado con éxito."
      });
    } else {
      res.status(404).json({
        message: "No se encontró el lote para eliminar."
      });
    }
  } catch (error) {
    console.error("Error al eliminar lote:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};
