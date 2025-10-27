import { Router } from "express";
import { get_tipo_negocio, create_negocio, update_tipo_negocio, get_negocios_por_usuario } from "../controllers/controler.tipo.negocio.js";

const router = Router();

router.get("/listar", get_tipo_negocio);
router.post("/crear_negocio", create_negocio);
router.put("/Update_negocio/:id", update_tipo_negocio);
router.get("/usuario/:usuario_id", get_negocios_por_usuario);

export default router;

