import { Router } from "express";
import { ActualizarCliente, CrearClientes, EliminarCliente, GetClientesByIdUsuario, listarClientes, ObtenerComprasDeCliente } from "../controllers/controler.cliente.js";

const routeClientes = Router();

routeClientes.get('/listar', listarClientes);
routeClientes.post('/registrar', CrearClientes);
routeClientes.put('/actualizar/:id', ActualizarCliente);
routeClientes.delete('/eliminar/:id', EliminarCliente);
routeClientes.get('/ClienteUsuario/:id_usuario', GetClientesByIdUsuario);
routeClientes.get('/usuario/:id/compras', ObtenerComprasDeCliente);

export default routeClientes;
