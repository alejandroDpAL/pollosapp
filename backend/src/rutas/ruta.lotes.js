import { Router } from "express";
import { get_lotes, create_lote, update_lote, get_lotesByUsuario } from "../controllers/controler.lotes.js";

const routeLotes = Router();

routeLotes.get("/listar", get_lotes);
routeLotes.post("/crear-lotes", create_lote);
routeLotes.put("/actualizar/:id", update_lote);
routeLotes.get("/usuario/:usuario_id", get_lotesByUsuario);

export default routeLotes;
