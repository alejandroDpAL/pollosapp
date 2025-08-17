import { Router } from "express";
import { get_lotes, create_lote, update_lote } from "../controllers/controler.lotes.js";

const routeLotes = Router();

routeLotes.get("/lotes", get_lotes);
routeLotes.post("/crear-lotes", create_lote);
routeLotes.put("/lotes/:id", update_lote);

export default routeLotes;
