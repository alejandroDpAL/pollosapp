import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarVentas, CrearVentaConproducto, CrearVentas, EliminarVentas, get_negocios_por_usuario, listarVentas, listarVentasPorCliente, listarVentasPorClienteNuevoEnpoint, listarVentasPorUsuario, ObtenerDetalleVenta, ObtenerVentasDeProducto } from "../controllers/controler.ventas.js";
import { validateCreateVenta, validateUpdateVenta, validateVentaId, validateUsuarioId, validateClienteId } from "../middleware/validators.js";
const routeVentas = Router()

// Todas las rutas requieren autenticación
routeVentas.get('/listar', verifyToken, listarVentas)
routeVentas.get('/usuario/:usuario_id', verifyToken, validateUsuarioId, listarVentasPorUsuario)
routeVentas.get('/cliente/:cliente_id', verifyToken, validateClienteId, listarVentasPorCliente)
routeVentas.post('/registrar', verifyToken, validateCreateVenta, CrearVentas)
routeVentas.put('/actualizar/:id_venta', verifyToken, validateUpdateVenta, ActualizarVentas)
routeVentas.delete('/eliminar/:id_venta', verifyToken, validateVentaId, EliminarVentas)
routeVentas.get("/negocios/usuario/:usuario_id", verifyToken, validateUsuarioId, get_negocios_por_usuario);
routeVentas.post("/ventas/registrada", verifyToken, validateCreateVenta, CrearVentaConproducto);
routeVentas.get("/detalle/:id", verifyToken, ObtenerDetalleVenta);
routeVentas.get("/productos/:id/ventas", verifyToken, ObtenerVentasDeProducto);
routeVentas.get('/clientes/:cliente_id/ventas', verifyToken, validateClienteId, listarVentasPorClienteNuevoEnpoint);


export default routeVentas