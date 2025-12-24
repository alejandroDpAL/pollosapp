import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { get_reportes_lote, create_reporte_lote, update_reporte_lote, get_reportes_lote_por_usuario, ReportePorLote, ReporteGeneralNegocio } from "../controllers/controler.Reporte.lote.js";

const router = Router();

// Todas las rutas requieren autenticación
router.get("/listar", verifyToken, get_reportes_lote);
router.post("/crear_repoerte_lote", verifyToken, create_reporte_lote);
router.put("/updatelote/:id", verifyToken, update_reporte_lote);
router.get("/usuario/:id", verifyToken, get_reportes_lote_por_usuario)
router.get("/reportes/negocio/:id", verifyToken, ReporteGeneralNegocio)
router.get("/reportes/lote/:id_lote/Usario/:id_usuario", verifyToken, ReportePorLote)

export default router;
