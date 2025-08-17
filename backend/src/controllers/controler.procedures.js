import { pool } from "../database/conexion.js";


export const registrarPerdida = async (req, res) => {
    const { lote_id, cantidad, motivo, descripcion, fecha_perdida } = req.body;

    try {
        if (!lote_id || !cantidad || !motivo || !fecha_perdida) {
            return res.status(400).json({ message: "Campos obligatorios faltantes." });
        }

        const [rows] = await pool.query(
            "CALL RegistrarPerdida(?, ?, ?, ?, ?)",
            [lote_id, cantidad, motivo, descripcion, fecha_perdida]
        );

        res.status(201).json({
            message: " Pérdida registrada con éxito.",
            data: rows
        });
    } catch (error) {
        console.error("❌ Error al registrar pérdida:", error);
        res.status(500).json({ message: "Error en el servidor.", error: error.message });
    }
};


export const registrarVenta = async (req, res) => {
    const { lote_id, cantidad, precio_unitario, fecha_venta } = req.body;

    try {
        if (!lote_id || !cantidad || !precio_unitario || !fecha_venta) {
            return res.status(400).json({ message: "Campos obligatorios faltantes." });
        }

        const [rows] = await pool.query(
            "CALL RegistrarVenta(?, ?, ?, ?)",
            [lote_id, cantidad, precio_unitario, fecha_venta]
        );

        res.status(201).json({
            message: " Venta registrada con éxito.",
            data: rows
        });
    } catch (error) {
        console.error("❌ Error al registrar venta:", error);
        res.status(500).json({ message: "Error en el servidor.", error: error.message });
    }
};


export const cerrarLote = async (req, res) => {
    const { lote_id } = req.body;

    try {
        if (!lote_id) {
            return res.status(400).json({ message: "El ID del lote es obligatorio." });
        }

        const [rows] = await pool.query("CALL CerrarLote(?)", [lote_id]);

        res.status(200).json({
            message: " Lote cerrado correctamente.",
            data: rows
        });
    } catch (error) {
        console.error("❌ Error al cerrar lote:", error);
        res.status(500).json({ message: "Error en el servidor.", error: error.message });
    }
};
