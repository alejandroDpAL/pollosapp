import { Router } from "express";
import { 
    AuthUserController, 
    RefreshTokenController, 
    LogoutController,
    LogoutAllController 
} from "../controllers/controler.auth.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const authRouter = Router();

// Rutas públicas (no requieren autenticación)
authRouter.post("/authLogin", AuthUserController);
authRouter.post("/login", AuthUserController); // Alias más estándar
authRouter.post("/refresh", RefreshTokenController); // Renovar access token
authRouter.post("/logout", LogoutController); // Cerrar sesión (revocar refresh token)

// Rutas protegidas (requieren access token)
authRouter.post("/logout-all", verifyToken, LogoutAllController); // Cerrar todas las sesiones

export default authRouter;
