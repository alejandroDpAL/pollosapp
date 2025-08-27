import { pool } from "../database/conexion.js";

export const get_tipo_negocio = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM negocio");
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
export const create_negocio = async (req, res) => {
  const { nombre, descripcion, activo, logo, correo, fecha, telefono } = req.body;

  try {
    // Validar campos obligatorios
    const camposObligatorios = { nombre, logo, correo, telefono };
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
      INSERT INTO negocio (nombre, descripcion, activo, logo, correo, fecha, telefono)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      nombre,
      descripcion || null,
      activo !== undefined ? activo : 1, // por defecto activo
      logo,
      correo,
      fecha || null,
      telefono
    ]);

    if (result.affectedRows > 0) {
      return res.status(201).json({
        message: "Tipo de negocio creado con éxito.",
        id: result.insertId
      });
    }

    return res.status(400).json({
      message: "No se logró crear el tipo de negocio, intente nuevamente."
    });

  } catch (error) {
    console.error("Error al crear tipo de negocio:", error);
    return res.status(500).json({
      message: "Error en el servidor.",
      error: error.message
    });
  }
};



export const update_tipo_negocio = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, activo, logo, correo, fecha, telefono } = req.body;

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
            UPDATE negocio
            SET nombre = ?, descripcion = ?, activo = ?, logo = ?, correo = ?, fecha  = ?, telefono = ?
            WHERE id = ?
        `;

    const [result] = await pool.query(sql, [
      nombre,
      descripcion,
      activo,
      logo,
      correo,
      fecha,
      telefono,
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
