import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { get_lotes, create_lote, update_lote, get_lotesByUsuario, ObtenerDetalleLote, ObtenerStockGeneral } from "../controllers/controler.lotes.js";

const routeLotes = Router();

// Todas las rutas requieren autenticación
routeLotes.get("/listar", verifyToken, get_lotes);
routeLotes.post("/crear-lotes", verifyToken, create_lote);
routeLotes.put("/actualizar/:id", verifyToken, update_lote);
routeLotes.get("/usuario/:usuario_id", verifyToken, get_lotesByUsuario);
routeLotes.get("/lotes/:id", verifyToken, ObtenerDetalleLote);
routeLotes.get("/stock", verifyToken, ObtenerStockGeneral);



export default routeLotes;
