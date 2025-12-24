import { Router } from "express";
import {  AuthUserController,  RefreshTokenController,  LogoutController, LogoutAllController } from "../controllers/controler.auth.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const authRouter = Router();

// Rutas públicas (no requieren autenticación)
authRouter.post("/authLogin", AuthUserController);
authRouter.post("/login", AuthUserController); 
authRouter.post("/refresh", RefreshTokenController); 
authRouter.post("/logout", LogoutController); 
authRouter.post("/logout-all", verifyToken, LogoutAllController); 

export default authRouter;
