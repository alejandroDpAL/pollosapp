import { pool } from "../database/conexion.js";



export const get_perdidas = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM perdidas");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener perdidas:", error);
        res.status(500).json({
            message: "Error en el servidor.",
            error: error.message
        });
    }
};

// POST crear pérdida
export const create_perdida = async (req, res) => {
  const { lote_id, cantidad, motivo, descripcion, fecha_perdida } = req.body;

  try {
    // Validar campos obligatorios
    const camposObligatorios = { lote_id, cantidad, motivo, fecha_perdida };
    const faltantes = Object.entries(camposObligatorios)
      .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === "")
      .map(([campo]) => campo);

    if (faltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`
      });
    }

    // SQL de inserción (fecha_creacion se autogenera con CURRENT_TIMESTAMP)
    const sql = `
      INSERT INTO perdidas (lote_id, cantidad, motivo, descripcion, fecha_perdida)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      lote_id,
      cantidad,
      motivo,
      descripcion || null,
      fecha_perdida
    ]);

    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: "Pérdida registrada con éxito.",
        id: result.insertId
      });
    }

    return res.status(400).json({
      message: "No se logró registrar la pérdida, intente nuevamente."
    });

  } catch (error) {
    console.error("Error al crear pérdida:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};

// PUT actualizar pérdida
export const update_perdida = async (req, res) => {
    const { id } = req.params;
    const { lote_id, cantidad, motivo, descripcion, fecha_perdida } = req.body;

    try {
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "El ID de la pérdida es requerido y debe ser válido."
            });
        }

        // Validar campos obligatorios
        const camposObligatorios = { lote_id, cantidad, motivo, fecha_perdida };
        const faltantes = Object.entries(camposObligatorios)
            .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === "")
            .map(([campo]) => campo);

        if (faltantes.length > 0) {
            return res.status(400).json({
                message: `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`
            });
        }

        const sql = `
            UPDATE perdidas
            SET lote_id = ?, cantidad = ?, motivo = ?, descripcion = ?, fecha_perdida = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(sql, [
            lote_id,
            cantidad,
            motivo,
            descripcion || null,
            fecha_perdida,
            id
        ]);

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Pérdida actualizada con éxito."
            });
        } else {
            res.status(404).json({
                message: "No se encontró la pérdida para actualizar."
            });
        }
    } catch (error) {
        console.error("Error al actualizar pérdida:", error);
        res.status(500).json({
            message: "Error en el servidor.",
            error: error.message
        });
    }
};
