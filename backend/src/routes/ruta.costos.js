import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { create_costos, Get_costos, Get_costosByUsuario, update_costos } from "../controllers/controler.costos.js";
import { validateCreateCosto, validateUpdateCosto, validateUsuarioId } from "../middleware/validators.js";
const routeCostos = Router()

// Todas las rutas requieren autenticación
routeCostos.get('/listar', verifyToken, Get_costos)
routeCostos.post('/registrar', verifyToken, validateCreateCosto, create_costos)
routeCostos.put('/actualizar/:id', verifyToken, validateUpdateCosto, update_costos)
routeCostos.get("/usuario/:usuario_id", verifyToken, validateUsuarioId, Get_costosByUsuario)

export default routeCostos