import { Router } from "express";
import { ActualizarUsuario, CrearUsuarios, getUsuarioById, listarUsuarios, VentasPorUsuario } from "../controllers/controler.usuarios.js";

const routeUsers = Router()

routeUsers.get('/listar', listarUsuarios)
routeUsers.post('/registrar', CrearUsuarios)
routeUsers.put('/actualizar/:id_usuario', ActualizarUsuario)
routeUsers.get('/perfil/:id_usuario', getUsuarioById);
routeUsers.get('/usuarios/:id/ventas', VentasPorUsuario);

export default routeUsers