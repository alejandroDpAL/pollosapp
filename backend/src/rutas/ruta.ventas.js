import { Router } from "express";
import { ActualizarVentas, CrearVentas, EliminarVentas, listarVentas } from "../controllers/controler.ventas.js";
const routeVentas = Router()

routeVentas.get('/listar',listarVentas)
routeVentas.post('/registrar',CrearVentas)
routeVentas.put('/actualizar/:id_venta',ActualizarVentas)
routeVentas.delete('/eliminar/:id_venta',EliminarVentas)

export default routeVentas