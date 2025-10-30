import { Router } from "express";
import { ActualizarCliente, CrearClientes, EliminarCliente, GetClientesByIdUsuario, listarClientes } from "../controllers/controler.cliente.js";

const routeClientes = Router();

routeClientes.get('/listar', listarClientes);
routeClientes.post('/registrar', CrearClientes);
routeClientes.put('/actualizar/:id', ActualizarCliente);
routeClientes.delete('/eliminar/:id', EliminarCliente);
routeClientes.get('/ClienteUsuario/:id_usuario', GetClientesByIdUsuario);

export default routeClientes;
