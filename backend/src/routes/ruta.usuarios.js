import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ActualizarUsuario, CrearUsuarios, listarUsuarios, PerfilUsuario, VentasPorUsuario } from "../controllers/controler.usuarios.js";

const routeUsers = Router()

// Todas las rutas requieren autenticación
routeUsers.get('/listar', verifyToken, listarUsuarios) 
routeUsers.get('/perfil/:id_usuario', verifyToken, PerfilUsuario) 
routeUsers.post('/registrar', verifyToken, CrearUsuarios)
routeUsers.put('/actualizar/:id_usuario', verifyToken, ActualizarUsuario)
routeUsers.get('/usuarios/:id/ventas', verifyToken, VentasPorUsuario);


export default routeUsers