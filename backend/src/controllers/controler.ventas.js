import { pool } from "../database/conexion.js";

export const listarVentas = async (req, res) => {
  try {
    const sql = `
      SELECT 
        v.id,
        u.nombre AS nombre_usuario,
        c.nombre AS nombre_cliente,
        l.nombre AS nombre_lote,
        v.cantidad,
        v.precio_unitario,
        v.valor_total,
        v.fecha,
        v.observaciones
      FROM ventas v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      INNER JOIN clientes c ON v.cliente_id = c.id
      INNER JOIN lotes l ON v.lote_id = l.id
      ORDER BY v.fecha DESC;
    `;

    const [result] = await pool.query(sql);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: "No se encontraron ventas disponibles",
      });
    }
  } catch (error) {
    console.error("Error al listar ventas:", error);
    res.status(500).json({
      message: "Error de parte del servidor: " + error.message,
    });
  }
};

//Listar por usuario 
export const listarVentasPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    if (!usuario_id) {
      return res.status(400).json({
        message: "El ID del usuario es obligatorio."
      });
    }

    const sql = `
      SELECT 
        v.id,
        u.nombre AS nombre_usuario,
        c.nombre AS nombre_cliente,
        l.nombre AS nombre_lote,
        v.cantidad,
        v.precio_unitario,
        v.valor_total,
        v.fecha,
        v.observaciones
      FROM ventas v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      INNER JOIN clientes c ON v.cliente_id = c.id
      INNER JOIN lotes l ON v.lote_id = l.id
      WHERE v.usuario_id = ?
      ORDER BY v.fecha DESC;
    `;

    const [result] = await pool.query(sql, [usuario_id]);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: "No se encontraron ventas registradas por este usuario.",
      });
    }
  } catch (error) {
    console.error("Error al listar ventas por usuario:", error);
    res.status(500).json({
      message: "Error en el servidor: " + error.message,
    });
  }
};

//Listar por Cliente 
export const listarVentasPorCliente = async (req, res) => {
  const { cliente_id } = req.params;

  try {
    if (!cliente_id) {
      return res.status(400).json({
        message: "El ID del cliente es obligatorio."
      });
    }

    const sql = `
      SELECT 
        v.id,
        u.nombre AS nombre_usuario,
        c.nombre AS nombre_cliente,
        l.nombre AS nombre_lote,
        v.cantidad,
        v.precio_unitario,
        v.valor_total,
        v.fecha,
        v.observaciones
      FROM ventas v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      INNER JOIN clientes c ON v.cliente_id = c.id
      INNER JOIN lotes l ON v.lote_id = l.id
      WHERE v.cliente_id = ?
      ORDER BY v.fecha DESC;
    `;

    const [result] = await pool.query(sql, [cliente_id]);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: "Este cliente no tiene ventas registradas.",
      });
    }
  } catch (error) {
    console.error("Error al listar ventas por cliente:", error);
    res.status(500).json({
      message: "Error en el servidor: " + error.message,
    });
  }
};



export const CrearVentas = async (req, res) => {
  const { lote_id, cliente_id, usuario_id, cantidad, precio_unitario, fecha, observaciones } = req.body;

  try {
    // Validar campos obligatorios
    if (!lote_id || !cantidad || !precio_unitario || !fecha) {
      return res.status(400).json({
        message: "Los campos 'lote_id', 'cantidad', 'precio_unitario' y 'fecha' son obligatorios."
      });
    }

    // Verificar stock del lote
    const [lote] = await pool.query("SELECT cantidad_actual FROM lotes WHERE id = ?", [lote_id]);

    if (lote.length === 0) {
      return res.status(404).json({ message: "Lote no encontrado." });
    }

    const stockActual = lote[0].cantidad_actual;

    if (stockActual < cantidad) {
      return res.status(400).json({ message: "No hay suficiente stock en el lote." });
    }

    // Calcular valor total
    const valor_total = cantidad * precio_unitario;

    // Insertar venta
    const sqlVenta = `
      INSERT INTO ventas (lote_id, cliente_id, usuario_id, cantidad, precio_unitario, valor_total, fecha, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sqlVenta, [
      lote_id,
      cliente_id || null,
      usuario_id || null,
      cantidad,
      precio_unitario,
      valor_total,
      fecha,
      observaciones || null
    ]);

    // Actualizar stock del lote
    const sqlUpdateStock = `
      UPDATE lotes 
      SET cantidad_actual = cantidad_actual - ? 
      WHERE id = ?
    `;
    await pool.query(sqlUpdateStock, [cantidad, lote_id]);

    res.status(201).json({
      message: "Venta registrada y stock actualizado correctamente.",
      id: result.insertId,
      valor_total
    });

  } catch (error) {
    console.error("Error al registrar la venta:", error);
    res.status(500).json({
      message: "Error del servidor.",
      error: error.message
    });
  }
};

export const ActualizarVentas = async (req, res) => {
  const { id_venta } = req.params;
  const { lote_id, cliente_id, usuario_id, cantidad, precio_unitario, fecha, observaciones } = req.body;

  try {
    // Validar ID
    if (!id_venta || isNaN(Number(id_venta))) {
      return res.status(400).json({ message: "El ID de la venta es requerido y debe ser válido." });
    }

    const sql = `
      UPDATE ventas
      SET lote_id = ?, cliente_id = ?, usuario_id = ?, cantidad = ?, 
          precio_unitario = ?, fecha = ?, observaciones = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      lote_id,
      cliente_id,
      usuario_id,
      cantidad,
      precio_unitario,
      fecha,
      observaciones,
      id_venta,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "La venta fue actualizada correctamente." });
    } else {
      res.status(404).json({ message: "No se encontró la venta para actualizar." });
    }
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    res.status(500).json({
      message: "Ocurrió un error interno al actualizar la venta.",
      error: error.message,
    });
  }
};

export const EliminarVentas = async (req, res) => {
  try {
    const { id_venta } = req.params;

    let sql = "DELETE FROM ventas WHERE id_venta = ?";

    const [result] = await pool.query(sql, [id_venta]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Venta eliminado con exito.",
      });
    } else {
      res.status(404).json({
        message: "no se encontraron ventas disponibles para eliminar",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "ERROR DE PARTE DEL SERVIDOR" + error,
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

    const sql = `
      SELECT *
      FROM negocio
      WHERE usuario_id = ?
    `;

    const [rows] = await pool.query(sql, [usuario_id]);

    if (rows.length > 0) {
      return res.status(200).json(rows);
    } else {
      return res.status(404).json({
        message: "No se encontraron negocios registrados para este usuario."
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




export const CrearVentaConproducto = async (req, res) => {
  const { lote_id, producto_id, cliente_id, usuario_id, cantidad, precio_unitario, valor_total, fecha, observaciones } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // VALIDAR CAMPOS OBLIGATORIOS
    if (!lote_id || !cantidad || !precio_unitario || !fecha) {
      return res.status(400).json({ message: "Campos obligatorios faltantes." });
    }

    // VALIDAR CANTIDAD
    if (isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser un número mayor a 0." });
    }

    // VALIDAR PRECIO UNITARIO
    if (isNaN(precio_unitario) || precio_unitario <= 0) {
      return res.status(400).json({ message: "El precio_unitario debe ser mayor a 0." });
    }

    // VALIDAR FECHA
    if (isNaN(new Date(fecha).getTime())) {
      return res.status(400).json({ message: "La fecha no es válida." });
    }

    // VALIDAR QUE AL MENOS UNO EXISTA
    if (!producto_id && !cliente_id && !usuario_id) {
      return res.status(400).json({ message: "Debe indicar producto_id, cliente_id o usuario_id." });
    }

    // VALIDAR EXISTENCIA DEL PRODUCTO
    if (producto_id) {
      const [prod] = await connection.query("SELECT id FROM productos WHERE id = ?", [producto_id]);
      if (prod.length === 0) {
        return res.status(404).json({ message: "El producto no existe." });
      }
    }

    // VALIDAR EXISTENCIA DEL CLIENTE
    if (cliente_id) {
      const [cli] = await connection.query("SELECT id FROM clientes WHERE id = ?", [cliente_id]);
      if (cli.length === 0) {
        return res.status(404).json({ message: "El cliente no existe." });
      }
    }

    // VALIDAR EXISTENCIA DEL USUARIO
    if (usuario_id) {
      const [usu] = await connection.query("SELECT id FROM usuarios WHERE id = ?", [usuario_id]);
      if (usu.length === 0) {
        return res.status(404).json({ message: "El usuario no existe." });
      }
    }

    // VALIDAR LOTE
    const [lote] = await connection.query(
      "SELECT cantidad_actual, activo FROM lotes WHERE id = ?",
      [lote_id]
    );

    if (lote.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "El lote no existe." });
    }

    // VALIDAR QUE EL LOTE ESTÉ ACTIVO 
    if (lote[0].activo === 0) {
      return res.status(400).json({ message: "El lote está inactivo y no permite ventas." });
    }

    const stockActual = lote[0].cantidad_actual;
    const stockFinal = stockActual - cantidad;

    // VALIDAR STOCK
    if (stockActual < cantidad) {
      await connection.rollback();
      return res.status(400).json({
        message: "Stock insuficiente.",
        stock_actual: stockActual,
        cantidad_solicitada: cantidad
      });
    }

    // VALIDAR VALOR TOTAL 
    const valorEsperado = (precio_unitario * cantidad).toFixed(2);
    if (valor_total && Number(valor_total).toFixed(2) !== valorEsperado) {
      return res.status(400).json({
        message: "El valor_total no coincide con precio_unitario * cantidad.",
        esperado: valorEsperado,
        recibido: valor_total
      });
    }

    // INSERTAR VENTA
    const sqlVenta = `
      INSERT INTO ventas 
      (lote_id, producto_id, cliente_id, usuario_id, cantidad, precio_unitario, valor_total, fecha, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(sqlVenta, [
      lote_id,
      producto_id || null,
      cliente_id || null,
      usuario_id || null,
      cantidad,
      precio_unitario,
      valor_total || valorEsperado,
      fecha,
      observaciones || null
    ]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(500).json({ message: "No se pudo registrar la venta." });
    }

    // ACTUALIZAR STOCK
    await connection.query(
      "UPDATE lotes SET cantidad_actual = cantidad_actual - ? WHERE id = ?",
      [cantidad, lote_id]
    );

    await connection.commit();

    res.status(200).json({
      message: "Venta registrada y stock actualizado con éxito.",
      venta_id: result.insertId,
      stock_inicial: stockActual,
      cantidad_vendida: cantidad,
      stock_final: stockFinal,
      detalle: {
        lote_id,
        producto_id,
        cliente_id,
        usuario_id
      }
    });

  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).json({
      message: "Error del servidor.",
      error: error.message
    });

  } finally {
    connection.release();
  }
};





export const ObtenerDetalleVenta = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "Se requiere el ID de la venta." });
    }

    const sql = `
   SELECT 
  v.id AS venta_id,
  v.cantidad,
  v.precio_unitario,
  v.valor_total,
  v.fecha,
  v.observaciones,

  l.id AS lote_id,
  l.nombre AS lote_nombre,
  l.cantidad_inicial AS lote_cantidad_inicial,
  l.cantidad_actual AS lote_stock_actual,
  l.precio AS lote_precio,
  l.descripcion AS lote_descripcion,
  l.fecha AS lote_fecha,

  p.id AS producto_id,
  p.nombre AS producto_nombre,
  p.cantidad AS producto_stock_total,
  p.costo AS producto_costo,
  p.fecha_compra AS producto_fecha_compra,
  p.fecha_venta AS producto_fecha_venta,
  p.negocio_id AS producto_negocio_id,

  c.id AS cliente_id,
  c.nombre AS cliente_nombre,
  c.telefono AS cliente_telefono,
  c.correo AS cliente_correo,
  c.direccion AS cliente_direccion,
  c.estado AS cliente_estado,

  u.id AS usuario_id,
  u.nombre AS usuario_nombre,
  u.correo AS usuario_correo,
  u.telefono AS usuario_telefono,
  u.cargo AS usuario_cargo,
  u.estado AS usuario_estado

FROM ventas v
LEFT JOIN lotes l ON v.lote_id = l.id
LEFT JOIN productos p ON v.producto_id = p.id
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN usuarios u ON v.usuario_id = u.id

WHERE v.id = ?

    `;

    const [result] = await pool.query(sql, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada." });
    }

    res.status(200).json({
      message: "Detalle de la venta obtenido correctamente.",
      data: result[0]
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error del servidor.",
      error: error.message
    });
  }
};


export const ObtenerVentasDeProducto = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "Se requiere el ID del producto." });
    }

    const sql = `
      SELECT
        v.id AS venta_id,
        v.cantidad,
        v.precio_unitario,
        v.valor_total,
        v.fecha,

        l.id AS lote_id,
        l.nombre AS lote_nombre,
        l.precio AS lote_precio,

        p.id AS producto_id,
        p.nombre AS producto_nombre,

        u.id AS usuario_id,
        u.nombre AS usuario_nombre
      FROM ventas v
      LEFT JOIN lotes l ON v.lote_id = l.id
      LEFT JOIN productos p ON v.producto_id = p.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.producto_id = ?
      ORDER BY v.fecha DESC
    `;

    const [ventas] = await pool.query(sql, [id]);

    if (ventas.length === 0) {
      return res.status(200).json({
        message: "El producto no tiene ventas registradas.",
        ventas_totales: 0,
        cantidad_vendida: 0,
        ingresos_generados: 0,
        lotes_involucrados: [],
        ventas: []
      });
    }

    // Total ventas
    const ventasTotales = ventas.length;

    // Cantidad total vendida
    const cantidadVendida = ventas.reduce((sum, v) => sum + Number(v.cantidad), 0);

    // Ingresos generados
    const ingresosGenerados = ventas.reduce((sum, v) => sum + Number(v.valor_total), 0);

    //  Lotes involucrados 
    const lotesInvolucrados = [
      ...new Map(
        ventas.map(v => [v.lote_id, { lote_id: v.lote_id, lote_nombre: v.lote_nombre }])
      ).values()
    ];

    res.status(200).json({
      message: "Ventas del producto obtenidas correctamente.",
      ventas_totales: ventasTotales,
      cantidad_vendida: cantidadVendida,
      ingresos_generados: ingresosGenerados,
      lotes_involucrados: lotesInvolucrados,
      ventas: ventas
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error del servidor.",
      error: error.message
    });
  }
};
