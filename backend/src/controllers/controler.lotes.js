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

  try {
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

    // SQL de inserción
    const sql = `
      INSERT INTO lotes (producto_id, cantidad_inicial, cantidad_actual, precio, fecha, descripcion, nombre)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      producto_id,
      cantidad_inicial,
      cantidad_actual,
      precio,
      fecha,
      descripcion || null,
      nombre
    ]);

    if (result.affectedRows > 0) {
      res.status(201).json({
        message: "Lote creado con éxito.",
        id: result.insertId
      });
    } else {
      res.status(403).json({
        message: "No se logró crear el lote, intente nuevamente."
      });
    }
  } catch (error) {
    console.error("Error al crear lote:", error);
    res.status(500).json({
      message: "Error en el servidor.",
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
      descripcion,
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

    const sql = `
            UPDATE lotes
            SET  producto_id = ?, cantidad_inicial = ?, cantidad_actual = ?, precio = ?, fecha = ?, descripcion = ?, nombre = ?
            WHERE id = ?
        `;

    const [result] = await pool.query(sql, [
      producto_id,
      cantidad_inicial,
      cantidad_actual,
      precio,
      fecha,
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

    const sql = `
      SELECT 
        l.*,
        p.id AS producto_id_rel,
        p.nombre AS producto_nombre,
        p.negocio_id,
        n.nombre AS negocio_nombre
      FROM lotes l
      INNER JOIN productos p ON l.producto_id = p.id
      INNER JOIN negocio n ON p.negocio_id = n.id
      WHERE l.cantidad_actual > 0
      ORDER BY l.fecha DESC
    `;
    
    const [rows] = await pool.query(sql);

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      // Si no hay lotes con stock, intenta obtener todos los lotes para diagnóstico
      const sqlDiag = `
        SELECT 
          l.id,
          l.nombre,
          l.cantidad_actual,
          l.cantidad_inicial,
          p.nombre AS producto_nombre,
          n.nombre AS negocio_nombre
        FROM lotes l
        INNER JOIN productos p ON l.producto_id = p.id
        INNER JOIN negocio n ON p.negocio_id = n.id
        ORDER BY l.fecha DESC
        LIMIT 5
      `;
      
      const [allLotes] = await pool.query(sqlDiag);
      
      res.status(404).json({
        message: "No se encontraron lotes con stock disponible.",
        diagnostico: {
          total_lotes_en_bd: allLotes.length,
          lotes_sin_stock: allLotes.map(l => ({
            id: l.id,
            nombre: l.nombre,
            cantidad_actual: l.cantidad_actual,
            producto: l.producto_nombre,
            negocio: l.negocio_nombre
          }))
        }
      });
    }
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

    // Datos principales del lote + producto
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
        p.cantidad AS producto_stock_total,
        p.costo AS producto_costo
      FROM lotes l
      LEFT JOIN productos p ON l.producto_id = p.id
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
    console.log(error);
    res.status(500).json({
      message: "Error del servidor.",
      error: error.message
    });
  }
};
