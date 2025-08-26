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
        porcentaje_mortalidad
    } = req.body;

    try {
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "El ID del reporte es requerido y debe ser válido."
            });
        }

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
            UPDATE reportes_lote
            SET lote_id = ?, cantidad_inicial = ?, cantidad_vendida = ?, cantidad_perdida = ?, cantidad_restante = ?,
                total_ingresos = ?, total_costos = ?, ganancia_neta = ?, porcentaje_mortalidad = ?
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
            id
        ]);

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Reporte de lote actualizado con éxito."
            });
        } else {
            res.status(404).json({
                message: "No se encontró el reporte de lote para actualizar."
            });
        }
    } catch (error) {
        console.error("Error al actualizar reporte de lote:", error);
        res.status(500).json({
            message: "Error en el servidor.",
            error: error.message
        });
    }
};
