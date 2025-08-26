import { Router } from "express";
import { get_tipo_negocio, create_tipo_negocio, update_tipo_negocio } from "../controllers/controler.tipo.negocio.js";

const router = Router();

router.get("/tipo-negocio", get_tipo_negocio);
router.post("/tipo-negocio", create_tipo_negocio);
router.put("/tipo-negocio/:id", update_tipo_negocio);

export default router;

