import { pool } from "../database/conexion.js";

/**
 * Obtener estadísticas generales del negocio
 * GET /dashboard/stats/:negocio_id
 */
export const getEstadisticasNegocio = async (req, res) => {
    const { negocio_id } = req.params;

    try {
        // Validar que negocio_id sea válido
        if (!negocio_id || isNaN(negocio_id)) {
            return res.status(400).json({ 
                message: "ID de negocio inválido" 
            });
        }

        // 1. KPIs principales con comparación
        const [ventasResult] = await pool.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'realizada' OR estado = 'pagado' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                COALESCE(SUM(valor_total), 0) as ingreso_total,
                COALESCE(AVG(valor_total), 0) as ticket_promedio
            FROM ventas v
            JOIN lotes l ON v.lote_id = l.id
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?`,
            [negocio_id]
        );
        const ventasData = ventasResult[0] || {};

        // 2. Distribución por estado (para gráfica circular)
        const [distribucionEstados] = await pool.query(
            `SELECT 
                estado,
                COUNT(*) as cantidad,
                COALESCE(SUM(valor_total), 0) as monto,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ventas v2 
                    JOIN lotes l2 ON v2.lote_id = l2.id 
                    JOIN productos p2 ON l2.producto_id = p2.id 
                    WHERE p2.negocio_id = ?)), 2) as porcentaje
            FROM ventas v
            JOIN lotes l ON v.lote_id = l.id
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?
            GROUP BY estado
            ORDER BY cantidad DESC`,
            [negocio_id, negocio_id]
        );

        // 3. Tendencia últimos 30 días (comparación)
        const [tendenciaMensual] = await pool.query(
            `SELECT 
                DATE(v.fecha) as fecha,
                COUNT(*) as ventas,
                COALESCE(SUM(v.valor_total), 0) as ingresos
            FROM ventas v
            JOIN lotes l ON v.lote_id = l.id
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?
            AND v.fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(v.fecha)
            ORDER BY DATE(v.fecha) ASC`,
            [negocio_id]
        );

        // 4. Costos vs Ingresos (últimos 30 días)
        const [costosResult] = await pool.query(
            `SELECT 
                COALESCE(SUM(c.valor), 0) as total_costos,
                COUNT(*) as cantidad_costos
            FROM costos c
            JOIN lotes l ON c.lote_id = l.id
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?
            AND c.fecha_compra >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            [negocio_id]
        );
        const costosData = costosResult[0] || {};

        // 5. Métricas de inventario
        const [inventarioResult] = await pool.query(
            `SELECT 
                COUNT(*) as total_lotes,
                COALESCE(SUM(cantidad_actual), 0) as stock_total,
                COALESCE(SUM(cantidad_inicial - cantidad_actual), 0) as vendido_total,
                ROUND(AVG(cantidad_actual * 100.0 / cantidad_inicial), 2) as porcentaje_stock_promedio
            FROM lotes l
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?
            AND cantidad_inicial > 0`,
            [negocio_id]
        );
        const inventarioData = inventarioResult[0] || {};

        // 6. Tasa de conversión y pérdidas
        const [perdidasResult] = await pool.query(
            `SELECT 
                COALESCE(SUM(cantidad), 0) as cantidad_perdida,
                COUNT(*) as eventos_perdida
            FROM perdidas pd
            JOIN lotes l ON pd.lote_id = l.id
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?`,
            [negocio_id]
        );
        const perdidasData = perdidasResult[0] || {};

        // 7. Métricas de clientes
        const [clientesResult] = await pool.query(
            `SELECT 
                COUNT(DISTINCT c.id) as total_clientes,
                COUNT(DISTINCT v.cliente_id) as clientes_activos,
                ROUND(COUNT(DISTINCT v.cliente_id) * 100.0 / NULLIF(COUNT(DISTINCT c.id), 0), 2) as tasa_conversion
            FROM clientes c
            LEFT JOIN ventas v ON c.id = v.cliente_id AND v.fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            WHERE c.negocio_id = ? AND c.estado = 1`,
            [negocio_id]
        );
        const clientesData = clientesResult[0] || {};

        // 8. Rotación de inventario y días promedio de venta
        const [rotacionResult] = await pool.query(
            `SELECT 
                COALESCE(SUM(l.cantidad_inicial), 0) as total_inicial,
                COALESCE(SUM(l.cantidad_actual), 0) as total_actual,
                COALESCE(AVG(DATEDIFF(NOW(), l.fecha)), 0) as dias_promedio_inventario,
                COUNT(DISTINCT l.id) as lotes_totales,
                COUNT(DISTINCT CASE WHEN l.cantidad_actual = 0 THEN l.id END) as lotes_agotados
            FROM lotes l
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?
            AND l.fecha >= DATE_SUB(NOW(), INTERVAL 90 DAY)`,
            [negocio_id]
        );
        const rotacionData = rotacionResult[0] || {};

        // 9. Comparación período anterior (últimos 30 días vs 30 anteriores)
        const [periodoActualResult] = await pool.query(
            `SELECT 
                COUNT(*) as ventas_actuales,
                COALESCE(SUM(valor_total), 0) as ingresos_actuales
            FROM ventas v
            JOIN lotes l ON v.lote_id = l.id
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?
            AND v.fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            AND v.estado IN ('realizada', 'pagado')`,
            [negocio_id]
        );

        const [periodoAnteriorResult] = await pool.query(
            `SELECT 
                COUNT(*) as ventas_anteriores,
                COALESCE(SUM(valor_total), 0) as ingresos_anteriores
            FROM ventas v
            JOIN lotes l ON v.lote_id = l.id
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?
            AND v.fecha >= DATE_SUB(NOW(), INTERVAL 60 DAY)
            AND v.fecha < DATE_SUB(NOW(), INTERVAL 30 DAY)
            AND v.estado IN ('realizada', 'pagado')`,
            [negocio_id]
        );

        const periodoActual = periodoActualResult[0] || {};
        const periodoAnterior = periodoAnteriorResult[0] || {};

        // Calcular crecimiento
        const crecimientoVentas = periodoAnterior.ventas_anteriores > 0 
            ? (((periodoActual.ventas_actuales - periodoAnterior.ventas_anteriores) / periodoAnterior.ventas_anteriores) * 100).toFixed(2)
            : 0;
        
        const crecimientoIngresos = parseFloat(periodoAnterior.ingresos_anteriores) > 0
            ? (((parseFloat(periodoActual.ingresos_actuales) - parseFloat(periodoAnterior.ingresos_anteriores)) / parseFloat(periodoAnterior.ingresos_anteriores)) * 100).toFixed(2)
            : 0;

        // 10. Tasa de mortalidad y pérdidas
        const totalInicial = parseFloat(rotacionData.total_inicial) || 0;
        const totalPerdidas = parseFloat(perdidasData.cantidad_perdida) || 0;
        const tasaMortalidad = totalInicial > 0 ? ((totalPerdidas / totalInicial) * 100).toFixed(2) : 0;

        // Calcular métricas derivadas
        const ingresoTotal = parseFloat(ventasData.ingreso_total) || 0;
        const costoTotal = parseFloat(costosData.total_costos) || 0;
        const gananciaNeta = ingresoTotal - costoTotal;
        const margenGanancia = ingresoTotal > 0 ? ((gananciaNeta / ingresoTotal) * 100).toFixed(2) : 0;

        // Rotación de inventario (veces que se vende el inventario)
        const inventarioPromedio = (parseFloat(rotacionData.total_inicial) + parseFloat(rotacionData.total_actual)) / 2;
        const vendidoTotal = parseFloat(rotacionData.total_inicial) - parseFloat(rotacionData.total_actual);
        const rotacionInventario = inventarioPromedio > 0 ? (vendidoTotal / inventarioPromedio).toFixed(2) : 0;

        return res.status(200).json({
            message: "Estadísticas obtenidas exitosamente",
            data: {
                kpis: {
                    totalVentas: ventasData.total || 0,
                    ventasCompletadas: ventasData.completadas || 0,
                    ventasPendientes: ventasData.pendientes || 0,
                    ingresoTotal: parseFloat(ingresoTotal).toFixed(2),
                    ticketPromedio: parseFloat(ventasData.ticket_promedio).toFixed(2),
                    costoTotal: parseFloat(costoTotal).toFixed(2),
                    gananciaNeta: parseFloat(gananciaNeta).toFixed(2),
                    margenGanancia: margenGanancia,
                    totalClientes: clientesData.total_clientes || 0,
                    clientesActivos: clientesData.clientes_activos || 0,
                    tasaConversion: clientesData.tasa_conversion || 0
                },
                crecimiento: {
                    crecimientoVentas: parseFloat(crecimientoVentas),
                    crecimientoIngresos: parseFloat(crecimientoIngresos),
                    ventasPeriodoActual: periodoActual.ventas_actuales || 0,
                    ventasPeriodoAnterior: periodoAnterior.ventas_anteriores || 0,
                    ingresosPeriodoActual: parseFloat(periodoActual.ingresos_actuales).toFixed(2),
                    ingresosPeriodoAnterior: parseFloat(periodoAnterior.ingresos_anteriores).toFixed(2)
                },
                distribucionEstados: distribucionEstados,
                tendenciaMensual: tendenciaMensual,
                inventario: {
                    totalLotes: inventarioData.total_lotes || 0,
                    stockTotal: inventarioData.stock_total || 0,
                    vendidoTotal: inventarioData.vendido_total || 0,
                    porcentajeStock: inventarioData.porcentaje_stock_promedio || 0,
                    rotacionInventario: parseFloat(rotacionInventario),
                    diasPromedioInventario: Math.round(parseFloat(rotacionData.dias_promedio_inventario)),
                    lotesAgotados: rotacionData.lotes_agotados || 0,
                    tasaMortalidad: parseFloat(tasaMortalidad)
                },
                perdidas: {
                    cantidadPerdida: perdidasData.cantidad_perdida || 0,
                    eventosPerdida: perdidasData.eventos_perdida || 0
                }
            }
        });

    } catch (error) {
        console.error("Error al obtener estadísticas:", error.message);
        return res.status(500).json({ 
            message: "Error interno al obtener estadísticas",
            error: error.message
        });
    }
};

/**
 * Obtener datos de ventas por día para gráficos
 * GET /dashboard/chart/ventas/:negocio_id?days=7
 */
export const getVentasPorDia = async (req, res) => {
    const { negocio_id } = req.params;
    const { days = 7 } = req.query;

    try {
        if (!negocio_id || isNaN(negocio_id)) {
            return res.status(400).json({ 
                message: "ID de negocio inválido",
                data: []
            });
        }

        // Obtener ventas por día de los últimos N días
        const [ventasData] = await pool.query(
            `SELECT 
                DATE(v.fecha) as fecha,
                COUNT(*) as cantidad_ventas,
                COALESCE(SUM(v.valor_total), 0) as ingreso_dia
            FROM ventas v
            JOIN lotes l ON v.lote_id = l.id
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?
            AND v.fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
            AND v.estado IN ('realizada', 'pagado')
            GROUP BY DATE(v.fecha)
            ORDER BY DATE(v.fecha) ASC`,
            [negocio_id, parseInt(days)]
        );

        // Si no hay datos, retornar array vacío
        if (!ventasData || ventasData.length === 0) {
            return res.status(200).json({
                message: "Sin datos disponibles",
                data: []
            });
        }

        // Transformar datos para la gráfica de forma segura
        const chartData = ventasData.map(item => {
            const fecha = new Date(item.fecha);
            const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            const labelDia = dias[fecha.getDay()];
            const labelFecha = fecha.getDate();
            
            return {
                label: `${labelDia} ${labelFecha}`,
                value: Math.round(parseFloat(item.ingreso_dia) || 0),
                cantidad: parseInt(item.cantidad_ventas) || 0
            };
        });

        return res.status(200).json({
            message: "Datos de gráfico obtenidos exitosamente",
            data: chartData
        });

    } catch (error) {
        console.error("Error al obtener datos de gráfico:", error);
        return res.status(200).json({ 
            message: "Error al obtener datos pero retornando array vacío",
            data: [],
            error: error.message
        });
    }
};

/**
 * Obtener últimas ventas con detalles para seguimiento
 * GET /dashboard/ultimas-ventas/:negocio_id?limit=10
 */
export const getUltimasVentas = async (req, res) => {
    const { negocio_id } = req.params;
    const { limit = 10 } = req.query;

    try {
        if (!negocio_id || isNaN(negocio_id)) {
            return res.status(400).json({ 
                message: "ID de negocio inválido",
                data: []
            });
        }

        // Obtener últimas ventas con información del cliente y producto
        const [ventasData] = await pool.query(
            `SELECT 
                v.id,
                v.fecha,
                v.estado,
                v.valor_total,
                v.cantidad,
                v.precio_unitario,
                c.nombre as cliente_nombre,
                c.telefono as cliente_telefono,
                p.nombre as producto_nombre,
                l.id as lote_id,
                l.nombre as lote_nombre
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            JOIN lotes l ON v.lote_id = l.id
            JOIN productos p ON l.producto_id = p.id
            WHERE p.negocio_id = ?
            ORDER BY v.fecha DESC
            LIMIT ?`,
            [negocio_id, parseInt(limit)]
        );

        return res.status(200).json({
            message: "Últimas ventas obtenidas exitosamente",
            data: ventasData || []
        });

    } catch (error) {
        console.error("Error al obtener últimas ventas:", error);
        return res.status(500).json({ 
            message: "Error al obtener últimas ventas",
            data: [],
            error: error.message
        });
    }
};
