import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { create_costos, Get_costos, Get_costosByUsuario, update_costos } from "../controllers/controler.costos.js";
const routeCostos = Router()

// Todas las rutas requieren autenticación
routeCostos.get('/listar', verifyToken, Get_costos)
routeCostos.post('/registrar', verifyToken, create_costos)
routeCostos.put('/actualizar/:id', verifyToken, update_costos)
routeCostos.get("/usuario/:usuario_id", verifyToken, Get_costosByUsuario)

export default routeCostos