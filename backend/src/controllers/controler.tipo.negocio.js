import { pool } from "../database/conexion.js";

export const get_tipo_negocio = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM negocio");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener tipos de negocio:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};

// POST crear tipo de negocio
export const create_negocio = async (req, res) => {
  const { usuario_id, nombre, descripcion, activo, logo, correo, fecha, telefono } = req.body;

  try {
    // Validar campos obligatorios
    const camposObligatorios = { usuario_id, nombre, logo, correo, telefono };
    const faltantes = Object.entries(camposObligatorios)
      .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === "")
      .map(([campo]) => campo);

    if (faltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`
      });
    }

    // SQL de inserción
    if (isNaN(usuario_id)) {
      return res.status(400).json({
        message: "El ID del usuario debe ser numérico."
      });
    }

    const sql = `
      INSERT INTO negocio (usuario_id, nombre, descripcion, activo, logo, correo, fecha, telefono)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      usuario_id,
      nombre,
      descripcion || null,
      activo !== undefined ? activo : 1, // por defecto activo
      logo,
      correo,
      fecha || null,
      telefono
    ]);

    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: "Tipo de negocio creado con éxito.",
        id: result.insertId
      });
    }

    return res.status(400).json({
      message: "No se logró crear el tipo de negocio, intente nuevamente."
    });

  } catch (error) {
    console.error("Error al crear tipo de negocio:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};



export const update_tipo_negocio = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, activo, logo, correo, fecha, telefono } = req.body;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: "El ID del tipo de negocio es requerido y debe ser válido."
      });
    }

    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({
        message: "El campo 'nombre' es obligatorio."
      });
    }

    const sql = `
            UPDATE negocio
            SET nombre = ?, descripcion = ?, activo = ?, logo = ?, correo = ?, fecha  = ?, telefono = ?
            WHERE id = ?
        `;

    const [result] = await pool.query(sql, [
      nombre,
      descripcion,
      activo,
      logo,
      correo,
      fecha,
      telefono,
      id
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Tipo de negocio actualizado con éxito."
      });
    } else {
      res.status(404).json({
        message: "No se encontró el tipo de negocio para actualizar."
      });
    }
  } catch (error) {
    console.error("Error al actualizar tipo de negocio:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
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
      WHERE usuario_id = ? AND activo = 1
      ORDER BY nombre ASC
    `;

    const [rows] = await pool.query(sql, [usuario_id]);

    if (rows.length > 0) {
      return res.status(200).json(rows);
    } else {
      return res.status(404).json({
        message: "No se encontraron negocios para este usuario."
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


export const InfoNegocio = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "Se requiere ID del negocio." });
    }

    // Info del negocio
    const [negocio] = await pool.query(`
      SELECT *
      FROM negocio
      WHERE id = ?
    `, [id]);

    if (negocio.length === 0) {
      return res.status(404).json({ message: "Negocio no encontrado." });
    }

    // Productos del negocio
    const [productos] = await pool.query(`
      SELECT 
        id, nombre, cantidad, costo, fecha_compra
      FROM productos
      WHERE negocio_id = ?
    `, [id]);

    // Lotes del negocio
    const [lotes] = await pool.query(`
      SELECT 
        l.id,
        l.nombre,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.precio,
        l.fecha
      FROM lotes l
      INNER JOIN productos p ON l.producto_id = p.id
      WHERE p.negocio_id = ?
    `, [id]);

    // Total ventas del negocio
    const [ventasTotal] = await pool.query(`
      SELECT SUM(v.valor_total) AS total_ventas
      FROM ventas v
      INNER JOIN productos p ON v.producto_id = p.id
      WHERE p.negocio_id = ?
    `, [id]);

    // Total costos del negocio
    const [costosTotal] = await pool.query(`
      SELECT SUM(c.valor) AS total_costos
      FROM costos c
      INNER JOIN lotes l ON c.lote_id = l.id
      INNER JOIN productos p ON l.producto_id = p.id
      WHERE p.negocio_id = ?
    `, [id]);

    const totalVentas = ventasTotal[0].total_ventas || 0;
    const totalCostos = costosTotal[0].total_costos || 0;
    const ganancia = totalVentas - totalCostos;

    res.status(200).json({
      message: "Información del negocio obtenida correctamente.",
      negocio: negocio[0],
      resumen: {
        total_ventas: totalVentas,
        total_costos: totalCostos,
        ganancia_neta: ganancia
      },
      productos,
      lotes
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al obtener la información del negocio.",
      error: error.message
    });
  }
};


export const anularNegocio = async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: "El ID del negocio es requerido y debe ser válido."
      });
    }

    if (!usuario_id) {
      return res.status(400).json({
        message: "El ID del usuario es requerido."
      });
    }

    // Verificar que el negocio pertenece al usuario
    const [negocio] = await pool.query(
      "SELECT * FROM negocio WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (negocio.length === 0) {
      return res.status(404).json({
        message: "No tienes permiso para anular este negocio."
      });
    }

    // Anular todas las ventas activas de este negocio
    const updateVentasSql = `
      UPDATE ventas v
      INNER JOIN productos p ON v.producto_id = p.id
      SET v.estado = 'anulado'
      WHERE p.negocio_id = ? AND v.estado != 'anulado'
    `;
    
    const [ventasResult] = await pool.query(updateVentasSql, [id]);
    console.log(`Se anularon ${ventasResult.affectedRows} ventas para el negocio ${id}`);

    // Cambiar estado del negocio a inactivo
    const [result] = await pool.query(
      "UPDATE negocio SET activo = 0 WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        message: "Negocio cerrado exitosamente. Se anularon todas las ventas activas.",
        negocioId: id,
        ventasAnuladas: ventasResult.affectedRows
      });
    } else {
      return res.status(400).json({
        message: "No se pudo cerrar el negocio. Intenta nuevamente."
      });
    }

  } catch (error) {
    console.error("Error al anular negocio:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};

// DELETE - Eliminar negocio 
export const deleteNegocio = async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: "El ID del negocio es requerido y debe ser válido."
      });
    }

    if (!usuario_id) {
      return res.status(400).json({
        message: "El ID del usuario es requerido."
      });
    }

    // Verificar que el negocio pertenece al usuario
    const [negocio] = await pool.query(
      "SELECT * FROM negocio WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (negocio.length === 0) {
      return res.status(404).json({
        message: "No tienes permiso para eliminar este negocio."
      });
    }

    // Verificar si el negocio tiene ventas activas
    const [ventas] = await pool.query(`
      SELECT COUNT(*) as total_ventas
      FROM ventas v
      INNER JOIN productos p ON v.producto_id = p.id
      WHERE p.negocio_id = ? AND v.estado != 'anulado'
    `, [id]);

    if (ventas[0].total_ventas > 0) {
      return res.status(400).json({
        message: `No puedes eliminar este negocio. Tiene ${ventas[0].total_ventas} venta(s) activa(s). Primero anula o elimina las ventas.`,
        totalVentas: ventas[0].total_ventas
      });
    }

    // Verificar si el negocio tiene lotes con stock
    const [lotes] = await pool.query(`
      SELECT COUNT(*) as total_lotes
      FROM lotes l
      INNER JOIN productos p ON l.producto_id = p.id
      WHERE p.negocio_id = ? AND l.cantidad_actual > 0
    `, [id]);

    if (lotes[0].total_lotes > 0) {
      return res.status(400).json({
        message: `No puedes eliminar este negocio. Tiene ${lotes[0].total_lotes} lote(s) con stock. Primero vende o descarta el inventario.`,
        totalLotes: lotes[0].total_lotes
      });
    }

    // Hard delete: 
    const [result] = await pool.query(
      "DELETE FROM negocio WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        message: "Negocio eliminado exitosamente.",
        negocioId: id
      });
    } else {
      return res.status(400).json({
        message: "No se pudo eliminar el negocio. Intenta nuevamente."
      });
    }

  } catch (error) {
    console.error("Error al eliminar negocio:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};
