import { pool } from "../database/conexion.js";

export const get_tipo_negocio = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM tipo_negocio");
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
export const create_tipo_negocio = async (req, res) => {
    const { nombre, descripcion, activo } = req.body;

    try {
        // Validar campo obligatorio
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({
                message: "El campo 'nombre' es obligatorio."
            });
        }

        const sql = `
            INSERT INTO tipo_negocio (nombre, descripcion, activo)
            VALUES (?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            nombre,
            descripcion || null,
            activo !== undefined ? activo : 1
        ]);

        if (result.affectedRows > 0) {
            res.status(201).json({
                message: "Tipo de negocio creado con éxito.",
                id: result.insertId
            });
        }
    } catch (error) {
        console.error("Error al crear tipo de negocio:", error);
        res.status(500).json({
            message: "Error en el servidor.",
            error: error.message
        });
    }
};


export const update_tipo_negocio = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

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
            UPDATE tipo_negocio
            SET nombre = ?, descripcion = ?, activo = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(sql, [
            nombre,
            descripcion || null,
            activo !== undefined ? activo : 1,
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
