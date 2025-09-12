import { Router } from "express";
import { create_costos, Get_costos, update_costos } from "../controllers/controler.costos.js";
const routeCostos = Router()

routeCostos.get('/listar',Get_costos)
routeCostos.post('/registrar',create_costos)
routeCostos.put('/actualizar/:id',update_costos)

export default routeCostos