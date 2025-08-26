import { Router } from "express";
import { get_reportes_lote, create_reporte_lote, update_reporte_lote } from "../controllers/controler.Reporte.lote.js";

const router = Router();

router.get("/listar", get_reportes_lote);
router.post("/crear_repoerte_lote", create_reporte_lote);
router.put("/updatelote/:id", update_reporte_lote);

export default router;
