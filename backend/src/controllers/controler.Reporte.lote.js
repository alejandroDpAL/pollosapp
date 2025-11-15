import { pool } from "../database/conexion.js";


export const get_reportes_lote = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reportes_lote");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener reportes de lote:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};

// POST crear reporte de lote
export const create_reporte_lote = async (req, res) => {
  const {
    lote_id,
    cantidad_inicial,
    cantidad_vendida,
    cantidad_perdida,
    cantidad_restante,
    total_ingresos,
    total_costos,
    ganancia_neta,
    porcentaje_mortalidad
  } = req.body;

  try {
    // Validar campos obligatorios
    const camposObligatorios = {
      lote_id,
      cantidad_inicial,
      cantidad_vendida,
      cantidad_perdida,
      cantidad_restante,
      total_ingresos,
      total_costos,
      ganancia_neta,
      porcentaje_mortalidad
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
      INSERT INTO reportes_lote (
        lote_id, cantidad_inicial, cantidad_vendida, cantidad_perdida, cantidad_restante,
        total_ingresos, total_costos, ganancia_neta, porcentaje_mortalidad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      lote_id,
      cantidad_inicial,
      cantidad_vendida,
      cantidad_perdida,
      cantidad_restante,
      total_ingresos,
      total_costos,
      ganancia_neta,
      porcentaje_mortalidad
    ]);

    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: "Reporte de lote creado con éxito.",
        id: result.insertId
      });
    }

    return res.status(400).json({
      message: "No se pudo registrar el reporte del lote, intente nuevamente."
    });

  } catch (error) {
    console.error("Error al crear reporte de lote:", error);
    res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};


// PUT actualizar reporte de lote

export const update_reporte_lote = async (req, res) => {
  const { id } = req.params;
  const {
    lote_id,
    cantidad_inicial,
    cantidad_vendida,
    cantidad_perdida,
    cantidad_restante,
    total_ingresos,
    total_costos,
    ganancia_neta,
    porcentaje_mortalidad,
  } = req.body;

  try {
    // Validar ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        message: "El ID del reporte es requerido y debe ser un número válido.",
      });
    }

    // Validar campos obligatorios (diferenciar string vs number)
    const camposObligatorios = {
      lote_id,
      cantidad_inicial,
      cantidad_vendida,
      cantidad_perdida,
      cantidad_restante,
      total_ingresos,
      total_costos,
      ganancia_neta,
      porcentaje_mortalidad,
    };

    const faltantes = Object.entries(camposObligatorios)
      .filter(([_, valor]) => {
        if (valor === undefined || valor === null) return true;
        if (typeof valor === "string" && valor.trim() === "") return true;
        return false;
      })
      .map(([campo]) => campo);

    if (faltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`,
      });
    }

    // Query de actualización
    const sql = `
      UPDATE reportes_lote
      SET 
        lote_id = ?, 
        cantidad_inicial = ?, 
        cantidad_vendida = ?, 
        cantidad_perdida = ?, 
        cantidad_restante = ?, 
        total_ingresos = ?, 
        total_costos = ?, 
        ganancia_neta = ?, 
        porcentaje_mortalidad = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      lote_id,
      cantidad_inicial,
      cantidad_vendida,
      cantidad_perdida,
      cantidad_restante,
      total_ingresos,
      total_costos,
      ganancia_neta,
      porcentaje_mortalidad,
      id,
    ]);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        message: "Reporte de lote actualizado con éxito.",
      });
    } else {
      return res.status(404).json({
        message: "No se encontró el reporte de lote para actualizar.",
      });
    }
  } catch (error) {
    console.error("Error al actualizar reporte de lote:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message,
    });
  }
};


export const get_reportes_lote_por_usuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    if (!usuario_id) {
      return res.status(400).json({
        message: "El ID del usuario es obligatorio.",
      });
    }

    // Consulta que une reportes_lote con lotes (y opcionalmente con negocios)
    const sql = `
      SELECT rl.*
      FROM reportes_lote rl
      INNER JOIN lotes l ON rl.lote_id = l.id
      WHERE l.usuario_id = ?
    `;

    const [rows] = await pool.query(sql, [usuario_id]);

    if (rows.length > 0) {
      return res.status(200).json(rows);
    } else {
      return res.status(404).json({
        message: "No se encontraron reportes de lote para este usuario.",
      });
    }
  } catch (error) {
    console.error("Error al obtener reportes de lote por usuario:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message,
    });
  }
};


export const ReporteGeneralNegocio = async (req, res) => {
  try {
    // Total ventas
    const [ventasTotal] = await pool.query(`
      SELECT SUM(valor_total) AS total_ventas
      FROM ventas
    `);

    //  Total costos
    const [costosTotal] = await pool.query(`
      SELECT SUM(valor) AS total_costos
      FROM costos
    `);

    //  Productos más vendidos
    const [productosMasVendidos] = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        SUM(v.cantidad) AS cantidad_vendida,
        SUM(v.valor_total) AS ingresos_generados
      FROM ventas v
      INNER JOIN productos p ON v.producto_id = p.id
      GROUP BY p.id
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `);

    //  Clientes más frecuentes
    const [clientesFrecuentes] = await pool.query(`
      SELECT 
        c.id,
        c.nombre,
        COUNT(v.id) AS cantidad_compras,
        SUM(v.valor_total) AS total_gastado
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE c.id IS NOT NULL
      GROUP BY c.id
      ORDER BY cantidad_compras DESC
      LIMIT 10
    `);

    const totalVentas = ventasTotal[0].total_ventas || 0;
    const totalCostos = costosTotal[0].total_costos || 0;
    const ganancia = totalVentas - totalCostos;

    res.status(200).json({
      message: "Reporte general del negocio generado correctamente.",
      resumen: {
        total_ventas: totalVentas,
        total_costos: totalCostos,
        ganancia_neta: ganancia
      },
      productos_mas_vendidos: productosMasVendidos,
      clientes_mas_frecuentes: clientesFrecuentes
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al generar el reporte del negocio.",
      error: error.message
    });
  }
};


export const ReportePorLote = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "Se requiere ID del lote." });
    }

    // Obtener datos del reporte almacenado
    const sql = `
      SELECT
        lote_id,
        cantidad_inicial,
        cantidad_vendida,
        cantidad_perdida,
        cantidad_restante,
        total_ingresos,
        total_costos,
        ganancia_neta,
        porcentaje_mortalidad,
        fecha_generacion
      FROM reportes_lote
      WHERE lote_id = ?
    `;

    const [result] = await pool.query(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No existe reporte para este lote." });
    }

    res.status(200).json({
      message: "Reporte del lote obtenido correctamente.",
      data: result[0]
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al obtener el reporte del lote.",
      error: error.message
    });
  }
};
