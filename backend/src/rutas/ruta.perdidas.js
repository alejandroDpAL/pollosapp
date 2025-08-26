import { Router } from "express";
import { get_perdidas, create_perdida, update_perdida } from "../controllers/controler.perdidas.js";

const router = Router();

router.get("/perdidas", get_perdidas);
router.post("/crear-perdidas", create_perdida);
router.put("/perdidas/:id", update_perdida);

export default router;
