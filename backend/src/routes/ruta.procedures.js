import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { registrarPerdida, registrarVenta, cerrarLote, getPerdidasByUsuario } from "../controllers/controler.procedures.js";

const router = Router();


router.post("/registrar-perdida", verifyToken, registrarPerdida);
router.get("/perdidas/usuario/:usuario_id", verifyToken, getPerdidasByUsuario);

router.post("/registrar-venta", verifyToken, registrarVenta);

router.put("/cerrar-lote", verifyToken, cerrarLote);

export default router;
