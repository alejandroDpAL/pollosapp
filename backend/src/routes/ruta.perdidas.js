import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { get_perdidas, create_perdida, update_perdida, get_perdidasByUsuario } from "../controllers/controler.perdidas.js";
import { validateCreatePerdida, validateUpdatePerdida, validateUsuarioId } from "../middleware/validators.js";

const router = Router();

// Todas las rutas requieren autenticación
router.get("/listar", verifyToken, get_perdidas);
router.post("/crear-perdidas", verifyToken, validateCreatePerdida, create_perdida);
router.put("/perdidas/:id", verifyToken, validateUpdatePerdida, update_perdida);
router.get("/usuario/:usuario_id", verifyToken, validateUsuarioId, get_perdidasByUsuario);

export default router;
