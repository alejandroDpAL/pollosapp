import { Router } from "express";
import { create_costos, Get_costos, Get_costosByUsuario, update_costos } from "../controllers/controler.costos.js";
const routeCostos = Router()

routeCostos.get('/listar',Get_costos)
routeCostos.post('/registrar',create_costos)
routeCostos.put('/actualizar/:id',update_costos)
routeCostos.get("/usuario/:usuario_id", Get_costosByUsuario)

export default routeCostos