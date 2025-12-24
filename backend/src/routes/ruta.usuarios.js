import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarUsuario, CrearUsuarios, listarUsuarios, PerfilUsuario, VentasPorUsuario } from "../controllers/controler.usuarios.js";
import { validateCreateUser, validateUpdateUser, validateUserId } from "../middleware/validators.js";

const routeUsers = Router()

// Todas las rutas requieren autenticación
routeUsers.get('/listar', verifyToken, listarUsuarios) 
routeUsers.get('/perfil/:id_usuario', verifyToken, validateUserId, PerfilUsuario) 
routeUsers.post('/registrar', verifyToken, validateCreateUser, CrearUsuarios)
routeUsers.put('/actualizar/:id_usuario', verifyToken, validateUpdateUser, ActualizarUsuario)
routeUsers.get('/usuarios/:id/ventas', verifyToken, validateUserId, VentasPorUsuario);


export default routeUsers