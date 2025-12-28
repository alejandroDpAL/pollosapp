import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarCliente, CrearClientes, EliminarCliente, GetClientesByIdUsuario, listarClientes, ObtenerComprasDeCliente } from "../controllers/controler.cliente.js";
import { validateCreateClient, validateUpdateClient, validateClientId, validateClientIdUsuario } from "../middleware/validators.js";

const routeClientes = Router();

// Todas las rutas requieren autenticación
routeClientes.get('/listar', verifyToken, listarClientes);
routeClientes.post('/registrar', verifyToken, validateCreateClient, CrearClientes);
routeClientes.put('/actualizar/:id', verifyToken, validateUpdateClient, ActualizarCliente);
routeClientes.delete('/eliminar/:id', verifyToken, validateClientId, EliminarCliente);
routeClientes.get('/ClienteUsuario/:id_usuario', verifyToken, validateClientIdUsuario, GetClientesByIdUsuario);
routeClientes.get('/usuario/:id/compras', verifyToken, validateClientIdUsuario, ObtenerComprasDeCliente);

export default routeClientes;
