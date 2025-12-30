import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarProducto, CrearProductos, EliminarProductos, listarProductos, listarProductosPorUsuario, listarProductosPorNegocio } from "../controllers/controler.producto.js";
import { validateCreateProduct, validateUpdateProduct, validateProductId, validateUsuarioId } from "../middleware/validators.js";

const routeProducts = Router()

// Todas las rutas requieren autenticación
routeProducts.get('/listar', verifyToken, listarProductos)
routeProducts.post('/registrar', verifyToken, validateCreateProduct, CrearProductos)
routeProducts.put('/actualizar/:id', verifyToken, validateUpdateProduct, ActualizarProducto)
routeProducts.delete('/eliminar/:id_producto', verifyToken, validateProductId, EliminarProductos)
routeProducts.get("/usuario/:usuario_id", verifyToken, validateUsuarioId, listarProductosPorUsuario);
routeProducts.get("/negocio/:negocio_id", verifyToken, listarProductosPorNegocio);

export default routeProducts