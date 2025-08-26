import { pool } from "../database/conexion.js";


export const Get_costos = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM costos");
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                message: "No se encontraron costos",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error al conectarse con el servidor: " + error.message,
        });
    }
}

export const create_costos = async (req, res) => {
    const { lote_id, nombre, valor, fecha_compra, observaciones, fecha_creacion } = req.body;

    try {
        // Validar campos obligatorios
        const camposObligatorios = { lote_id, nombre, valor, fecha_compra, fecha_creacion };
        const faltantes = Object.entries(camposObligatorios)
            .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === '')
            .map(([campo]) => campo);

        if (faltantes.length > 0) {
            return res.status(400).json({
                message: `Faltan los siguientes campos obligatorios: ${faltantes.join(', ')}`
            });
        }

        // SQL de inserción
        const sql = `
            INSERT INTO costos (lote_id, nombre, valor, fecha_compra, observaciones, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [rows] = await pool.query(sql, [
            lote_id,
            nombre,
            valor,
            fecha_compra,
            observaciones || null,
            fecha_creacion
        ]);

        if (rows.affectedRows > 0) {
            res.status(200).json({
                message: "Costo registrado con éxito."
            });
        } else {
            res.status(403).json({
                message: "No se logró registrar el costo, intente nuevamente."
            });
        }

    } catch (error) {
        console.error("Error al registrar costo:", error);
        res.status(500).json({
            message: "Error en el servidor.",
            error: error.message
        });
    }
};


export const update_costos = async (req, res) => {
    const { id } = req.params;
    const { lote_id, categoria, concepto, monto, fecha_costo, observaciones } = req.body;

    try {
        // Validar ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "El ID del costo es requerido y debe ser válido."
            });
        }

        // Validar campos obligatorios
        const camposObligatorios = { lote_id, categoria, concepto, monto, fecha_costo };
        const faltantes = Object.entries(camposObligatorios)
            .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === "")
            .map(([campo]) => campo);

        if (faltantes.length > 0) {
            return res.status(400).json({
                message: `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`
            });
        }

        // SQL para actualizar
        const sql = `
            UPDATE costos
            SET lote_id = ?, categoria = ?, concepto = ?, monto = ?, fecha_costo = ?, observaciones = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(sql, [
            lote_id,
            categoria,
            concepto,
            monto,
            fecha_costo,
            observaciones || null,
            id
        ]);

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Costo actualizado con éxito."
            });
        } else {
            res.status(404).json({
                message: "No se encontró el costo para actualizar."
            });
        }
    } catch (error) {
        console.error("Error al actualizar costo:", error);
        res.status(500).json({
            message: "Error en el servidor.",
            error: error.message
        });
    }
};
