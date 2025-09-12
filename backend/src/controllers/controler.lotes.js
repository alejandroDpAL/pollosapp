import { pool } from "../database/conexion.js";


export const get_lotes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM lotes");
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
    producto_id,
    cantidad_inicial,
    cantidad_actual,
    precio,
    fecha,
    descripcion,
    nombre
  } = req.body;

  try {
    // Validar campos obligatorios
    const camposObligatorios = {
      producto_id,
      cantidad_inicial,
      cantidad_actual,
      precio,
      fecha,
      nombre
    };

    const faltantes = Object.entries(camposObligatorios)
      .filter(([_, valor]) => valor === undefined || valor === null || valor.toString().trim() === "")
      .map(([campo]) => campo);

    if (faltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`
      });
    }

    // SQL de inserción
    const sql = `
      INSERT INTO lotes (producto_id, cantidad_inicial, cantidad_actual, precio, fecha, descripcion, nombre)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      producto_id,
      cantidad_inicial,
      cantidad_actual,
      precio,
      fecha,
      descripcion || null,
      nombre
    ]);

    if (result.affectedRows > 0) {
      res.status(201).json({
        message: "Lote creado con éxito.",
        id: result.insertId
      });
    } else {
      res.status(403).json({
        message: "No se logró crear el lote, intente nuevamente."
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
    producto_id,
    cantidad_inicial,
    cantidad_actual,
    precio,
    fecha,
    descripcion,
    nombre
  } = req.body;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: "El ID del lote es requerido y debe ser válido."
      });
    }

    // Validar campos obligatorios
    const camposObligatorios = {
      producto_id,
      cantidad_inicial,
      cantidad_actual,
      precio,
      fecha,
      descripcion,
      nombre
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
            UPDATE lotes
            SET  producto_id = ?, cantidad_inicial = ?, cantidad_actual = ?, precio = ?, fecha = ?, descripcion = ?, nombre = ?
            WHERE id = ?
        `;

    const [result] = await pool.query(sql, [
      producto_id,
      cantidad_inicial,
      cantidad_actual,
      precio,
      fecha,
      descripcion,
      nombre,
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
