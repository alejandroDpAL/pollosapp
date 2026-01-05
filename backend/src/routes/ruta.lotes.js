import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { 
  get_lotes, 
  get_lotesByUsuario, 
  get_lotesByNegocio, 
  create_lote, 
  update_lote, 
  ObtenerDetalleLote, 
  ObtenerStockGeneral, 
  delete_lote 
} from "../controllers/controler.lotes.js";
import { validateCreateLote, validateUpdateLote, validateLoteId, validateUsuarioId } from "../middleware/validators.js";

const routeLotes = Router();

routeLotes.get("/listar", verifyToken, get_lotes);
routeLotes.get("/stock", verifyToken, ObtenerStockGeneral);

routeLotes.get("/negocio/:negocio_id", verifyToken, get_lotesByNegocio);

// Compatibilidad: Obtener lotes por usuario (todos sus negocios)
routeLotes.get("/usuario/:usuario_id", verifyToken, validateUsuarioId, get_lotesByUsuario);

// Detalle de lote específico
routeLotes.get("/lotes/:id", verifyToken, validateLoteId, ObtenerDetalleLote);

// CRUD
routeLotes.post("/crear-lotes", verifyToken, validateCreateLote, create_lote);
routeLotes.put("/actualizar/:id", verifyToken, validateUpdateLote, update_lote);
routeLotes.delete("/eliminar/:id", verifyToken, validateLoteId, delete_lote);

export default routeLotes;
