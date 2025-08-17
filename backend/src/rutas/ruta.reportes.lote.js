import { Router } from "express";
import { get_reportes_lote, create_reporte_lote, update_reporte_lote } from "../controllers/controler.Reporte.lote.js";

const router = Router();

router.get("/reportes-lote", get_reportes_lote);
router.post("/reportes-lote", create_reporte_lote);
router.put("/reportes-lote/:id", update_reporte_lote);

export default router;
