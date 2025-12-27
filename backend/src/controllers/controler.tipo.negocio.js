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
  const { nombre, descripcion, activo, logo, correo, fecha, telefono } = req.body;

  try {
    // Validar campos obligatorios
    const camposObligatorios = { nombre, logo, correo, telefono };
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
      INSERT INTO negocio (nombre, descripcion, activo, logo, correo, fecha, telefono)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
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

    // Como la tabla negocio NO tiene usuario_id en la estructura actual,
    // esta consulta devuelve TODOS los negocios activos
    // TODO: Agregar campo usuario_id a la tabla negocio en la BD
    const sql = `
      SELECT *
      FROM negocio
      WHERE activo = 1
    `;

    const [rows] = await pool.query(sql);

    if (rows.length > 0) {
      return res.status(200).json(rows);
    } else {
      return res.status(404).json({
        message: "No se encontraron negocios activos."
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
