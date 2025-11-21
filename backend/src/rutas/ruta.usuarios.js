import { Router } from "express";
import { ActualizarUsuario, CrearUsuarios, listarUsuarios, PerfilUsuario } from "../controllers/controler.usuarios.js";

const routeUsers = Router()

routeUsers.get('/listar',listarUsuarios) 
routeUsers.get('/perfil/:id_usuario',PerfilUsuario) 
routeUsers.post('/registrar',CrearUsuarios)
routeUsers.put('/actualizar/:id_usuario',ActualizarUsuario)

export default routeUsers