import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { get_tipo_negocio, create_negocio, update_tipo_negocio, get_negocios_por_usuario, InfoNegocio } from "../controllers/controler.tipo.negocio.js";
import { validateCreateNegocio, validateUpdateNegocio, validateNegocioId, validateUsuarioId } from "../middleware/validators.js";

const router = Router();

// Todas las rutas requieren autenticación
router.get("/listar", verifyToken, get_tipo_negocio);
router.post("/crear_negocio", verifyToken, validateCreateNegocio, create_negocio);
router.put("/Update_negocio/:id", verifyToken, validateUpdateNegocio, update_tipo_negocio);
router.get("/usuario/:usuario_id", verifyToken, validateUsuarioId, get_negocios_por_usuario);
router.get("/negocios/:id", verifyToken, validateNegocioId, InfoNegocio);

export default router;

