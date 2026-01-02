import express from 'express';
import { getEstadisticasNegocio, getVentasPorDia, getUltimasVentas } from '../controllers/controler.estadisticas.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/stats/:negocio_id', verifyToken, getEstadisticasNegocio);
router.get('/chart/ventas/:negocio_id', verifyToken, getVentasPorDia);
router.get('/ultimas-ventas/:negocio_id', verifyToken, getUltimasVentas);
// estadisticas adicionales pueden ser añadidas aquí

export default router;
