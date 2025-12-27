import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarVentas, crearVenta, EliminarVentas, get_negocios_por_usuario, listarVentas, listarVentasPorCliente, listarVentasPorUsuario, ObtenerDetalleVenta, ObtenerVentasDeProducto } from "../controllers/controler.ventas.js";

const routeVentas = Router()

routeVentas.get('/listar', verifyToken, listarVentas)
routeVentas.get('/usuario/:usuario_id', verifyToken, listarVentasPorUsuario)
routeVentas.get('/cliente/:cliente_id', verifyToken, listarVentasPorCliente)
routeVentas.post('/registrar', verifyToken, crearVenta)
routeVentas.put('/actualizar/:id_venta', verifyToken, ActualizarVentas)
routeVentas.delete('/eliminar/:id_venta', verifyToken, EliminarVentas)
routeVentas.get("/negocios/usuario/:usuario_id", verifyToken, get_negocios_por_usuario)
routeVentas.get("/detalle/:id", verifyToken, ObtenerDetalleVenta)
routeVentas.get("/productos/:id/ventas", verifyToken, ObtenerVentasDeProducto)

export default routeVentas