import { pool } from "../database/conexion";


export const get_lotes = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM lote");
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
        codigo,
        producto_id,
        cantidad_inicial,
        cantidad_actual,
        precio_unitario,
        fecha_inicio,
        fecha_cierre,
        estado,
        observaciones
    } = req.body;

    try {
        // Validar campos obligatorios
        const camposObligatorios = {
            codigo,
            producto_id,
            cantidad_inicial,
            cantidad_actual,
            precio_unitario,
            fecha_inicio
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
            INSERT INTO lote (codigo, producto_id, cantidad_inicial, cantidad_actual, precio_unitario, fecha_inicio, fecha_cierre, estado, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            codigo,
            producto_id,
            cantidad_inicial,
            cantidad_actual,
            precio_unitario,
            fecha_inicio,
            fecha_cierre || null,
            estado || "activo",
            observaciones || null
        ]);

        if (result.affectedRows > 0) {
            res.status(201).json({
                message: "Lote creado con éxito.",
                id: result.insertId
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
        codigo,
        producto_id,
        cantidad_inicial,
        cantidad_actual,
        precio_unitario,
        fecha_inicio,
        fecha_cierre,
        estado,
        observaciones
    } = req.body;

    try {
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: "El ID del lote es requerido y debe ser válido."
            });
        }

        // Validar campos obligatorios
        const camposObligatorios = {
            codigo,
            producto_id,
            cantidad_inicial,
            cantidad_actual,
            precio_unitario,
            fecha_inicio
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
            UPDATE lote
            SET codigo = ?, producto_id = ?, cantidad_inicial = ?, cantidad_actual = ?, precio_unitario = ?, fecha_inicio = ?, fecha_cierre = ?, estado = ?, observaciones = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(sql, [
            codigo,
            producto_id,
            cantidad_inicial,
            cantidad_actual,
            precio_unitario,
            fecha_inicio,
            fecha_cierre || null,
            estado || "activo",
            observaciones || null,
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
