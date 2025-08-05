import { Router } from "express";
import { ActualizarCliente, CrearClientes, EliminarCliente, listarClientes } from "../controllers/controler.cliente.js";
const routeClientes = Router()

routeClientes.get('/listar',listarClientes)
routeClientes.post('/registrar',CrearClientes)
routeClientes.put('/actualizar/:id_cliente',ActualizarCliente)
routeClientes.delete('/eliminar/:id_cliente',EliminarCliente)

export default routeClientes