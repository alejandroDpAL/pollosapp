import { Router } from "express";
import { ActualizarVentas, CrearVentas, EliminarVentas, get_negocios_por_usuario, listarVentas, listarVentasPorCliente, listarVentasPorUsuario } from "../controllers/controler.ventas.js";
const routeVentas = Router()

routeVentas.get('/listar',listarVentas)
routeVentas.get('/usuario/:usuario_id',listarVentasPorUsuario)
routeVentas.get('/cliente/:cliente_id',listarVentasPorCliente)
routeVentas.post('/registrar',CrearVentas)
routeVentas.put('/actualizar/:id_venta',ActualizarVentas)
routeVentas.delete('/eliminar/:id_venta',EliminarVentas)
routeVentas.get("/negocios/usuario/:usuario_id", get_negocios_por_usuario);


export default routeVentas