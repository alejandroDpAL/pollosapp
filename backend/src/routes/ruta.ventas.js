import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarVentas, CrearVentaConproducto, CrearVentas, EliminarVentas, get_negocios_por_usuario, listarVentas, listarVentasPorCliente, listarVentasPorClienteNuevoEnpoint, listarVentasPorUsuario, ObtenerDetalleVenta, ObtenerVentasDeProducto } from "../controllers/controler.ventas.js";
const routeVentas = Router()

// Todas las rutas requieren autenticación
routeVentas.get('/listar', verifyToken, listarVentas)
routeVentas.get('/usuario/:usuario_id', verifyToken, listarVentasPorUsuario)
routeVentas.get('/cliente/:cliente_id', verifyToken, listarVentasPorCliente)
routeVentas.post('/registrar', verifyToken, CrearVentas)
routeVentas.put('/actualizar/:id_venta', verifyToken, ActualizarVentas)
routeVentas.delete('/eliminar/:id_venta', verifyToken, EliminarVentas)
routeVentas.get("/negocios/usuario/:usuario_id", verifyToken, get_negocios_por_usuario);
routeVentas.post("/ventas/registrada", verifyToken, CrearVentaConproducto);
routeVentas.get("/detalle/:id", verifyToken, ObtenerDetalleVenta);
routeVentas.get("/productos/:id/ventas", verifyToken, ObtenerVentasDeProducto);
// Nuevo endpoint: ventas completas del cliente (cliente + vendedor + productos + lotes)
routeVentas.get('/clientes/:cliente_id/ventas', verifyToken, listarVentasPorClienteNuevoEnpoint);


export default routeVentas