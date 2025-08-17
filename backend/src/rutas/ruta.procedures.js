import { Router } from "express";
import { registrarPerdida, registrarVenta, cerrarLote } from "../controllers/controler.procedures.js";

const router = Router();

// Procedimientos almacenados
router.post("/procedures/perdidas", registrarPerdida);
router.post("/procedures/ventas", registrarVenta);
router.post("/procedures/lotes/cerrar", cerrarLote);

export default router;
