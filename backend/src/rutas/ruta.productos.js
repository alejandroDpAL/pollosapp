import { Router } from "express";
import { ActualizarProducto, CrearProductos, EliminarProductos, listarProductos } from "../controllers/controler.producto.js";

const routeProducts = Router()

routeProducts.get('/listar',listarProductos)
routeProducts.post('/registrar',CrearProductos)
routeProducts.put('/actualizar/:id',ActualizarProducto)
routeProducts.delete('/eliminar/:id_producto',EliminarProductos)
export default routeProducts