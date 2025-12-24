import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarCliente, CrearClientes, EliminarCliente, GetClientesByIdUsuario, listarClientes, ObtenerComprasDeCliente } from "../controllers/controler.cliente.js";

const routeClientes = Router();

// Todas las rutas requieren autenticación
routeClientes.get('/listar', verifyToken, listarClientes);
routeClientes.post('/registrar', verifyToken, CrearClientes);
routeClientes.put('/actualizar/:id', verifyToken, ActualizarCliente);
routeClientes.delete('/eliminar/:id', verifyToken, EliminarCliente);
routeClientes.get('/ClienteUsuario/:id_usuario', verifyToken, GetClientesByIdUsuario);
routeClientes.get('/usuario/:id/compras', verifyToken, ObtenerComprasDeCliente);

export default routeClientes;
