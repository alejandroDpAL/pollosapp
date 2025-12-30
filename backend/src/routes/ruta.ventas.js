import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarVentas, actualizarEstadoVenta, crearVenta, EliminarVentas, get_negocios_por_usuario, listarVentas, listarVentasPorCliente, listarVentasPorUsuario, listarVentasPorNegocio, ObtenerDetalleVenta, ObtenerVentasDeProducto, ObtenerTrazabilidadVenta } from "../controllers/controler.ventas.js";
import { validateCreateVenta, validateUpdateVenta, validateVentaId, validateUsuarioId, validateClienteId } from "../middleware/validators.js";
const routeVentas = Router()

routeVentas.get('/listar', verifyToken, listarVentas)
routeVentas.get('/usuario/:usuario_id', verifyToken, validateUsuarioId, listarVentasPorUsuario)
routeVentas.get('/negocio/:negocio_id', verifyToken, listarVentasPorNegocio)
routeVentas.get('/cliente/:cliente_id', verifyToken, validateClienteId, listarVentasPorCliente)
routeVentas.post('/registrar', verifyToken, validateCreateVenta, crearVenta)
routeVentas.put('/actualizar/:id_venta', verifyToken, validateUpdateVenta, ActualizarVentas)
routeVentas.put('/:id', verifyToken, actualizarEstadoVenta)
// Ruta rápida para cambiar solo el estado
routeVentas.patch('/:id/estado', verifyToken, actualizarEstadoVenta)
routeVentas.delete('/eliminar/:id_venta', verifyToken, validateVentaId, EliminarVentas)
routeVentas.get("/negocios/usuario/:usuario_id", verifyToken, validateUsuarioId, get_negocios_por_usuario);
routeVentas.get("/detalle/:id", verifyToken, ObtenerDetalleVenta);
routeVentas.get("/trazabilidad/:id_venta", verifyToken, ObtenerTrazabilidadVenta);

export default routeVentas