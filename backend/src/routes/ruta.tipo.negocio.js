import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { get_tipo_negocio, create_negocio, update_tipo_negocio, get_negocios_por_usuario, InfoNegocio } from "../controllers/controler.tipo.negocio.js";

const router = Router();

// Todas las rutas requieren autenticación
router.get("/listar", verifyToken, get_tipo_negocio);
router.post("/crear_negocio", verifyToken, create_negocio);
router.put("/Update_negocio/:id", verifyToken, update_tipo_negocio);
router.get("/usuario/:usuario_id", verifyToken, get_negocios_por_usuario);
router.get("/negocios/:id", verifyToken, InfoNegocio);

export default router;

