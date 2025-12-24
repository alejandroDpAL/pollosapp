import { Router } from "express";
import {  AuthUserController,  RefreshTokenController,  LogoutController, LogoutAllController } from "../controllers/controler.auth.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validateLogin, validateRefreshToken } from "../middleware/validators.js";

const authRouter = Router();

// Rutas públicas (no requieren autenticación)
authRouter.post("/authLogin", validateLogin, AuthUserController);
authRouter.post("/login", validateLogin, AuthUserController); 
authRouter.post("/refresh", validateRefreshToken, RefreshTokenController); 
authRouter.post("/logout", LogoutController); 
authRouter.post("/logout-all", verifyToken, LogoutAllController); 

export default authRouter;
