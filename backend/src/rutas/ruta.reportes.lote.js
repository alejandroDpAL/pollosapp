import { Router } from "express";
import { get_reportes_lote, create_reporte_lote, update_reporte_lote, get_reportes_lote_por_usuario, ReportePorLote, ReporteGeneralNegocio } from "../controllers/controler.Reporte.lote.js";

const router = Router();

router.get("/listar", get_reportes_lote);
router.post("/crear_repoerte_lote", create_reporte_lote);
router.put("/updatelote/:id", update_reporte_lote);
router.get("/usuario/:usuario_id", get_reportes_lote_por_usuario)
router.get("/reportes/general", ReporteGeneralNegocio)
router.get("/reportes/lote/:id", ReportePorLote)

export default router;
