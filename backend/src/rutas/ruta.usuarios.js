import { Router } from "express";
import { ActualizarUsuario, CrearUsuarios, listarUsuarios } from "../controllers/controler.usuarios.js";

const routeUsers = Router()

routeUsers.get('/listar',listarUsuarios)
routeUsers.post('/registrar',CrearUsuarios)
routeUsers.put('/actualizar/:id_usuario',ActualizarUsuario)

export default routeUsers