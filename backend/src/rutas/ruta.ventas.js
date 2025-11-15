import { Router } from "express";
import { ActualizarVentas, CrearVentaConproducto, CrearVentas, EliminarVentas, get_negocios_por_usuario, listarVentas, ObtenerDetalleVenta, ObtenerVentasDeProducto } from "../controllers/controler.ventas.js";
const routeVentas = Router()

routeVentas.get('/listar', listarVentas)
routeVentas.post('/registrar', CrearVentas)
routeVentas.put('/actualizar/:id_venta', ActualizarVentas)
routeVentas.delete('/eliminar/:id_venta', EliminarVentas)
routeVentas.get("/negocios/usuario/:usuario_id", get_negocios_por_usuario);
routeVentas.post("/ventas/registrada", CrearVentaConproducto);
routeVentas.get("/detalle/:id", ObtenerDetalleVenta);
routeVentas.get("/productos/:id/ventas", ObtenerVentasDeProducto);

export default routeVentas