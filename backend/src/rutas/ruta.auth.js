import { Router } from "express";
import { AuthUserController } from "../controllers/controler.auth.js";

const authRouter = Router();

authRouter.post("/authLogin", AuthUserController);


export default authRouter;
