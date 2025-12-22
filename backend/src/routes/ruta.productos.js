import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarProducto, CrearProductos, EliminarProductos, listarProductos, listarProductosPorUsuario } from "../controllers/controler.producto.js";

const routeProducts = Router()

// Todas las rutas requieren autenticación
routeProducts.get('/listar', verifyToken, listarProductos)
routeProducts.post('/registrar', verifyToken, CrearProductos)
routeProducts.put('/actualizar/:id', verifyToken, ActualizarProducto)
routeProducts.delete('/eliminar/:id_producto', verifyToken, EliminarProductos)
routeProducts.get("/usuario/:usuario_id", verifyToken, listarProductosPorUsuario);
export default routeProducts