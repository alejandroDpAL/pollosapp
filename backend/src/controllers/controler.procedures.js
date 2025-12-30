import { pool } from "../database/conexion.js";


export const registrarPerdida = async (req, res) => {
    const { lote_id, cantidad, motivo, descripcion, fecha_perdida, usuario_id } = req.body;

    try {
        
        if (!lote_id || !cantidad || !motivo || !fecha_perdida || !usuario_id) {
            return res.status(400).json({ message: "Campos obligatorios faltantes: lote_id, cantidad, motivo, fecha_perdida, usuario_id." });
        }

        if (isNaN(cantidad) || cantidad <= 0) {
            return res.status(400).json({ message: "La cantidad debe ser un número positivo." });
        }

        
        const [loteCheck] = await pool.query(
            "SELECT l.id, l.cantidad_actual, p.negocio_id FROM lotes l INNER JOIN productos p ON l.producto_id = p.id WHERE l.id = ?",
            [lote_id]
        );

        if (loteCheck.length === 0) {
            return res.status(404).json({ message: "Lote no encontrado." });
        }

        if (loteCheck[0].cantidad_actual < cantidad) {
            return res.status(400).json({ 
                message: `Cantidad insuficiente en el lote. Disponible: ${loteCheck[0].cantidad_actual}` 
            });
        }

        // TRANSACCIÓN: Registrar pérdida + actualizar lote
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insertar pérdida
            const insertSql = `
                INSERT INTO perdidas (lote_id, usuario_id, cantidad, motivo, descripcion, fecha_perdida, fecha_creacion, fecha_actualizacion)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
            const [insertResult] = await connection.query(insertSql, 
                [lote_id, usuario_id, cantidad, motivo, descripcion || null, fecha_perdida]
            );

            // 2. Actualizar cantidad_actual del lote
            const updateSql = `
                UPDATE lotes 
                SET cantidad_actual = cantidad_actual - ?, fecha_actualizacion = NOW()
                WHERE id = ?
            `;
            await connection.query(updateSql, [cantidad, lote_id]);

            await connection.commit();

            res.status(201).json({
                message: "Pérdida registrada con éxito.",
                data: {
                    perdida_id: insertResult.insertId,
                    lote_id: lote_id,
                    cantidad: cantidad,
                    motivo: motivo,
                    fecha_perdida: fecha_perdida
                }
            });

        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Error al registrar pérdida:", error);
        res.status(500).json({ message: "Error en el servidor.", error: error.message });
    }
};


export const registrarVenta = async (req, res) => {
    const { lote_id, cantidad, precio_unitario, usuario_id, cliente_id } = req.body;

    try {
        // Validación de campos
        if (!lote_id || !cantidad || !precio_unitario || !usuario_id) {
            return res.status(400).json({ 
                message: "Campos obligatorios faltantes: lote_id, cantidad, precio_unitario, usuario_id." 
            });
        }

        if (isNaN(cantidad) || cantidad <= 0) {
            return res.status(400).json({ message: "La cantidad debe ser un número positivo." });
        }

        if (isNaN(precio_unitario) || precio_unitario <= 0) {
            return res.status(400).json({ message: "El precio unitario debe ser un número positivo." });
        }

        // Verificar lote y obtener negocio
        const [loteCheck] = await pool.query(
            "SELECT l.id, l.cantidad_actual, p.negocio_id FROM lotes l INNER JOIN productos p ON l.producto_id = p.id WHERE l.id = ?",
            [lote_id]
        );

        if (loteCheck.length === 0) {
            return res.status(404).json({ message: "Lote no encontrado." });
        }

        if (loteCheck[0].cantidad_actual < cantidad) {
            return res.status(400).json({ 
                message: `Cantidad insuficiente. Disponible: ${loteCheck[0].cantidad_actual}` 
            });
        }

        const negocio_id = loteCheck[0].negocio_id;

        // TRANSACCIÓN: Registrar venta + actualizar lote
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insertar venta
            const valor_total = cantidad * precio_unitario;
            const insertSql = `
                INSERT INTO ventas (lote_id, usuario_id, cliente_id, cantidad, precio_unitario, valor_total, estado, fecha, fecha_creacion, fecha_actualizacion)
                VALUES (?, ?, ?, ?, ?, ?, 'completada', NOW(), NOW(), NOW())
            `;
            const [insertResult] = await connection.query(insertSql, 
                [lote_id, usuario_id, cliente_id || null, cantidad, precio_unitario, valor_total]
            );

            // 2. Actualizar cantidad_actual del lote
            const updateSql = `
                UPDATE lotes 
                SET cantidad_actual = cantidad_actual - ?, fecha_actualizacion = NOW()
                WHERE id = ?
            `;
            await connection.query(updateSql, [cantidad, lote_id]);

            await connection.commit();

            res.status(201).json({
                message: "Venta registrada con éxito.",
                data: {
                    venta_id: insertResult.insertId,
                    lote_id: lote_id,
                    usuario_id: usuario_id,
                    cliente_id: cliente_id || null,
                    cantidad: cantidad,
                    precio_unitario: precio_unitario,
                    valor_total: valor_total,
                    estado: "completada"
                }
            });

        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Error al registrar venta:", error);
        res.status(500).json({ message: "Error en el servidor.", error: error.message });
    }
};


export const cerrarLote = async (req, res) => {
    const { lote_id } = req.body;

    try {
        if (!lote_id) {
            return res.status(400).json({ message: "El ID del lote es obligatorio." });
        }

        // Verificar que el lote existe
        const [loteCheck] = await pool.query(
            "SELECT id, estado FROM lotes WHERE id = ?",
            [lote_id]
        );

        if (loteCheck.length === 0) {
            return res.status(404).json({ message: "Lote no encontrado." });
        }

        if (loteCheck[0].estado === "cerrado") {
            return res.status(400).json({ message: "El lote ya está cerrado." });
        }

        // Actualizar estado del lote
        const sql = `
            UPDATE lotes 
            SET estado = 'cerrado', fecha_actualizacion = NOW()
            WHERE id = ?
        `;

        const [result] = await pool.query(sql, [lote_id]);

        res.status(200).json({
            message: "Lote cerrado correctamente.",
            data: {
                lote_id: lote_id,
                estado_anterior: loteCheck[0].estado,
                estado_nuevo: "cerrado"
            }
        });

    } catch (error) {
        console.error("Error al cerrar lote:", error);
        res.status(500).json({ message: "Error en el servidor.", error: error.message });
    }
};


export const getPerdidasByUsuario = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        if (!usuario_id || isNaN(usuario_id)) {
            return res.status(400).json({
                message: "El ID del usuario es obligatorio y debe ser válido."
            });
        }

        // Obtener pérdidas con trazabilidad completa
        const sql = `
            SELECT 
                pr.id AS perdida_id,
                pr.lote_id,
                pr.usuario_id,
                pr.cantidad,
                pr.motivo,
                pr.descripcion,
                pr.fecha_perdida,
                pr.fecha_creacion,
                pr.fecha_actualizacion,
                
                l.nombre AS lote_nombre,
                l.cantidad_inicial,
                l.cantidad_actual,
                
                p.id AS producto_id,
                p.nombre AS producto_nombre,
                
                n.id AS negocio_id,
                n.nombre AS negocio_nombre,
                
                u.id,
                u.nombre AS usuario_nombre,
                u.correo AS usuario_correo
            FROM perdidas pr
            INNER JOIN lotes l ON pr.lote_id = l.id
            INNER JOIN productos p ON l.producto_id = p.id
            INNER JOIN negocio n ON p.negocio_id = n.id
            INNER JOIN usuarios u ON pr.usuario_id = u.id
            WHERE pr.usuario_id = ?
            ORDER BY pr.fecha_creacion DESC
        `;

        const [rows] = await pool.query(sql, [usuario_id]);

        if (rows.length > 0) {
            res.status(200).json({
                total: rows.length,
                perdidas: rows
            });
        } else {
            res.status(404).json({
                message: "No se encontraron pérdidas para este usuario."
            });
        }

    } catch (error) {
        console.error("Error al obtener pérdidas por usuario:", error);
        res.status(500).json({
            message: "Error en el servidor.",
            error: error.message
        });
    }
};
