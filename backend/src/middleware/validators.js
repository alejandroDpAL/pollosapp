import { body, param, validationResult } from "express-validator";

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Errores de validación",
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// ============= VALIDACIONES DE AUTH =============
export const validateLogin = [
  body("user")
    .notEmpty().withMessage("El usuario es obligatorio")
    .isEmail().withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  handleValidationErrors
];

export const validateRefreshToken = [
  body("refreshToken")
    .notEmpty().withMessage("El refresh token es obligatorio")
    .isString().withMessage("El refresh token debe ser una cadena"),
  handleValidationErrors
];

// ============= VALIDACIONES DE USUARIOS =============
export const validateCreateUser = [
  body("nombre")
    .notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("correo")
    .notEmpty().withMessage("El correo es obligatorio")
    .isEmail().withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail(),
  body("contraseña")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("rol")
    .optional()
    .isIn(["admin", "usuario"]).withMessage("El rol debe ser 'admin' o 'usuario'"),
  body("estado")
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage("El estado debe ser 0 o 1"),
  handleValidationErrors
];

export const validateUpdateUser = [
  param("id_usuario")
    .notEmpty().withMessage("El ID del usuario es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  body("nombre")
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("correo")
    .optional()
    .isEmail().withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail(),
  body("contraseña")
    .optional()
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("rol")
    .optional()
    .isIn(["admin", "usuario"]).withMessage("El rol debe ser 'admin' o 'usuario'"),
  body("estado")
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage("El estado debe ser 0 o 1"),
  handleValidationErrors
];

export const validateUserId = [
  param("id_usuario")
    .notEmpty().withMessage("El ID del usuario es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

// ============= VALIDACIONES DE CLIENTES =============
export const validateCreateClient = [
  body("nombre")
    .notEmpty().withMessage("El nombre del cliente es obligatorio")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("usuarioId")
    .optional()
    .isInt({ min: 1 }).withMessage("El ID del usuario debe ser un número entero positivo"),
  body("telefono")
    .optional()
    .matches(/^[0-9+\-\s()]+$/).withMessage("El teléfono solo puede contener números y símbolos válidos"),
  body("correo")
    .optional()
    .isEmail().withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail(),
  body("direccion")
    .optional()
    .isLength({ max: 255 }).withMessage("La dirección no puede exceder 255 caracteres"),
  body("estado")
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage("El estado debe ser 0 o 1"),
  handleValidationErrors
];

export const validateUpdateClient = [
  param("id")
    .notEmpty().withMessage("El ID del cliente es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  body("nombre")
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("usuario_id")
    .optional()
    .isInt({ min: 1 }).withMessage("El ID del usuario debe ser un número entero positivo"),
  body("telefono")
    .optional()
    .matches(/^[0-9+\-\s()]+$/).withMessage("El teléfono solo puede contener números y símbolos válidos"),
  body("correo")
    .optional()
    .isEmail().withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail(),
  body("direccion")
    .optional()
    .isLength({ max: 255 }).withMessage("La dirección no puede exceder 255 caracteres"),
  body("estado")
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage("El estado debe ser 0 o 1"),
  handleValidationErrors
];

export const validateClientId = [
  param("id")
    .notEmpty().withMessage("El ID del cliente es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

export const validateClientIdUsuario = [
  param("id_usuario")
    .notEmpty().withMessage("El ID del usuario es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

// ============= VALIDACIONES DE PRODUCTOS =============
export const validateCreateProduct = [
  body("nombre")
    .notEmpty().withMessage("El nombre del producto es obligatorio")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("negocio_id")
    .notEmpty().withMessage("El ID del negocio es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del negocio debe ser un número entero positivo"),
  body("precio")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio debe ser un número positivo"),
  body("cantidad")
    .optional()
    .isInt({ min: 0 }).withMessage("La cantidad debe ser un entero positivo"),
  handleValidationErrors
];

export const validateUpdateProduct = [
  param("id")
    .notEmpty().withMessage("El ID del producto es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  body("nombre")
    .notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("negocio_id")
    .notEmpty().withMessage("El ID del negocio es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del negocio debe ser un número entero positivo"),
  body("precio")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio debe ser un número positivo"),
  body("cantidad")
    .optional()
    .isInt({ min: 0 }).withMessage("La cantidad debe ser un entero positivo"),
  handleValidationErrors
];

export const validateProductId = [
  param("id")
    .notEmpty().withMessage("El ID del producto es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

export const validateUsuarioId = [
  param("usuario_id")
    .notEmpty().withMessage("El ID del usuario es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

// ============= VALIDACIONES DE VENTAS =============
export const validateCreateVenta = [
  body("usuario_id")
    .notEmpty().withMessage("El ID del usuario es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del usuario debe ser un número entero positivo"),
  body("cliente_id")
    .notEmpty().withMessage("El ID del cliente es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del cliente debe ser un número entero positivo"),
  body("lote_id")
    .notEmpty().withMessage("El ID del lote es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del lote debe ser un número entero positivo"),
  body("cantidad")
    .notEmpty().withMessage("La cantidad es obligatoria")
    .isFloat({ min: 0.01 }).withMessage("La cantidad debe ser mayor a 0"),
  body("precio_unitario")
    .notEmpty().withMessage("El precio unitario es obligatorio")
    .isFloat({ min: 0 }).withMessage("El precio unitario debe ser un número positivo"),
  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe ser válida"),
  body("observaciones")
    .optional()
    .isLength({ max: 500 }).withMessage("Las observaciones no pueden exceder 500 caracteres"),
  handleValidationErrors
];

export const validateUpdateVenta = [
  param("id_venta")
    .notEmpty().withMessage("El ID de la venta es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  body("cantidad")
    .optional()
    .isFloat({ min: 0.01 }).withMessage("La cantidad debe ser mayor a 0"),
  body("precio_unitario")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio unitario debe ser un número positivo"),
  body("observaciones")
    .optional()
    .isLength({ max: 500 }).withMessage("Las observaciones no pueden exceder 500 caracteres"),
  handleValidationErrors
];

export const validateVentaId = [
  param("id_venta")
    .notEmpty().withMessage("El ID de la venta es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

export const validateClienteId = [
  param("cliente_id")
    .notEmpty().withMessage("El ID del cliente es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

// ============= VALIDACIONES DE LOTES =============
export const validateCreateLote = [
  body("nombre")
    .notEmpty().withMessage("El nombre del lote es obligatorio")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("producto_id")
    .notEmpty().withMessage("El ID del producto es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del producto debe ser un número entero positivo"),
  body("cantidad_inicial")
    .notEmpty().withMessage("La cantidad inicial es obligatoria")
    .isInt({ min: 1 }).withMessage("La cantidad inicial debe ser un número entero mayor a 0"),
  body("cantidad_actual")
    .notEmpty().withMessage("La cantidad actual es obligatoria")
    .isInt({ min: 1 }).withMessage("La cantidad actual debe ser un número entero mayor a 0"),
  body("precio")
    .notEmpty().withMessage("El precio es obligatorio")
    .isFloat({ min: 0.01 }).withMessage("El precio debe ser mayor a 0"),
  body("fecha")
    .notEmpty().withMessage("La fecha es obligatoria")
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("La fecha debe estar en formato YYYY-MM-DD"),
  body("descripcion")
    .optional()
    .isString().withMessage("La descripción debe ser una cadena de texto"),
  handleValidationErrors
];

export const validateUpdateLote = [
  param("id")
    .notEmpty().withMessage("El ID del lote es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  body("nombre")
    .notEmpty().withMessage("El nombre del lote es obligatorio")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("producto_id")
    .notEmpty().withMessage("El ID del producto es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del producto debe ser un número entero positivo"),
  body("cantidad_inicial")
    .notEmpty().withMessage("La cantidad inicial es obligatoria")
    .isInt({ min: 1 }).withMessage("La cantidad inicial debe ser un número entero mayor a 0"),
  body("cantidad_actual")
    .notEmpty().withMessage("La cantidad actual es obligatoria")
    .isInt({ min: 1 }).withMessage("La cantidad actual debe ser un número entero mayor a 0"),
  body("precio")
    .notEmpty().withMessage("El precio es obligatorio")
    .isFloat({ min: 0.01 }).withMessage("El precio debe ser mayor a 0"),
  body("fecha")
    .notEmpty().withMessage("La fecha es obligatoria")
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("La fecha debe estar en formato YYYY-MM-DD"),
  body("descripcion")
    .optional()
    .isString().withMessage("La descripción debe ser una cadena de texto"),
  handleValidationErrors
];

export const validateLoteId = [
  param("id")
    .notEmpty().withMessage("El ID del lote es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

// ============= VALIDACIONES DE COSTOS =============
export const validateCreateCosto = [
  body("usuario_id")
    .notEmpty().withMessage("El ID del usuario es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del usuario debe ser un número entero positivo"),
  body("descripcion")
    .notEmpty().withMessage("La descripción es obligatoria")
    .isLength({ min: 3, max: 255 }).withMessage("La descripción debe tener entre 3 y 255 caracteres")
    .trim(),
  body("monto")
    .notEmpty().withMessage("El monto es obligatorio")
    .isFloat({ min: 0.01 }).withMessage("El monto debe ser mayor a 0"),
  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe ser válida"),
  handleValidationErrors
];

export const validateUpdateCosto = [
  param("id")
    .notEmpty().withMessage("El ID del costo es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  body("descripcion")
    .optional()
    .isLength({ min: 3, max: 255 }).withMessage("La descripción debe tener entre 3 y 255 caracteres")
    .trim(),
  body("monto")
    .optional()
    .isFloat({ min: 0.01 }).withMessage("El monto debe ser mayor a 0"),
  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe ser válida"),
  handleValidationErrors
];

// ============= VALIDACIONES DE PÉRDIDAS =============
export const validateCreatePerdida = [
  body("lote_id")
    .notEmpty().withMessage("El ID del lote es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del lote debe ser un número entero positivo"),
  body("cantidad")
    .notEmpty().withMessage("La cantidad es obligatoria")
    .isFloat({ min: 0.01 }).withMessage("La cantidad debe ser mayor a 0"),
  body("motivo")
    .notEmpty().withMessage("El motivo es obligatorio")
    .isLength({ min: 3, max: 255 }).withMessage("El motivo debe tener entre 3 y 255 caracteres")
    .trim(),
  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe ser válida"),
  handleValidationErrors
];

export const validateUpdatePerdida = [
  param("id")
    .notEmpty().withMessage("El ID de la pérdida es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  body("cantidad")
    .optional()
    .isFloat({ min: 0.01 }).withMessage("La cantidad debe ser mayor a 0"),
  body("motivo")
    .optional()
    .isLength({ min: 3, max: 255 }).withMessage("El motivo debe tener entre 3 y 255 caracteres")
    .trim(),
  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe ser válida"),
  handleValidationErrors
];

// ============= VALIDACIONES DE TIPO NEGOCIO =============
export const validateCreateNegocio = [
  body("nombre")
    .notEmpty().withMessage("El nombre del negocio es obligatorio")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("usuario_id")
    .notEmpty().withMessage("El ID del usuario es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del usuario debe ser un número entero positivo"),
  body("logo")
    .notEmpty().withMessage("El logo es obligatorio")
    .isString().withMessage("El logo debe ser una cadena")
    .isLength({ max: 500 }).withMessage("El logo no puede exceder 500 caracteres"),
  body("correo")
    .notEmpty().withMessage("El correo es obligatorio")
    .isEmail().withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail(),
  body("telefono")
    .notEmpty().withMessage("El teléfono es obligatorio")
    .isString().withMessage("El teléfono debe ser texto")
    .matches(/^\d{7,20}$/).withMessage("El teléfono debe tener entre 7 y 20 dígitos"),
  body("descripcion")
    .optional()
    .isLength({ max: 500 }).withMessage("La descripción no puede exceder 500 caracteres"),
  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe ser válida"),
  body("activo")
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage("El estado debe ser 0 o 1"),
  handleValidationErrors
];

export const validateUpdateNegocio = [
  param("id")
    .notEmpty().withMessage("El ID del negocio es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  body("nombre")
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .trim(),
  body("descripcion")
    .optional()
    .isLength({ max: 500 }).withMessage("La descripción no puede exceder 500 caracteres"),
  body("activo")
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage("El estado debe ser 0 o 1"),
  body("logo")
    .optional()
    .isString().withMessage("El logo debe ser una cadena")
    .isLength({ max: 500 }).withMessage("El logo no puede exceder 500 caracteres"),
  body("correo")
    .optional()
    .isEmail().withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail(),
  body("telefono")
    .optional()
    .isString().withMessage("El teléfono debe ser texto")
    .matches(/^\d{7,20}$/).withMessage("El teléfono debe tener entre 7 y 20 dígitos"),
  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe ser válida"),
  handleValidationErrors
];

export const validateNegocioId = [
  param("id")
    .notEmpty().withMessage("El ID del negocio es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

// ============= VALIDACIONES DE REPORTES =============
export const validateCreateReporteLote = [
  body("lote_id")
    .notEmpty().withMessage("El ID del lote es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del lote debe ser un número entero positivo"),
  body("usuario_id")
    .notEmpty().withMessage("El ID del usuario es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID del usuario debe ser un número entero positivo"),
  body("fecha_inicio")
    .optional()
    .isISO8601().withMessage("La fecha de inicio debe ser válida"),
  body("fecha_fin")
    .optional()
    .isISO8601().withMessage("La fecha de fin debe ser válida"),
  handleValidationErrors
];

export const validateUpdateReporteLote = [
  param("id")
    .notEmpty().withMessage("El ID del reporte es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];

export const validateReporteLoteId = [
  param("id_lote")
    .notEmpty().withMessage("El ID del lote es obligatorio")
    .isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
  handleValidationErrors
];
