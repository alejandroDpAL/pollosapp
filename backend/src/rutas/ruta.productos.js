import { Router } from "express";
import { ActualizarProducto, CrearProductos, EliminarProductos, listarProductos, listarProductosPorUsuario } from "../controllers/controler.producto.js";

const routeProducts = Router()

routeProducts.get('/listar',listarProductos)
routeProducts.post('/registrar',CrearProductos)
routeProducts.put('/actualizar/:id',ActualizarProducto)
routeProducts.delete('/eliminar/:id_producto',EliminarProductos)
routeProducts.get("/usuario/:usuario_id", listarProductosPorUsuario);
export default routeProducts