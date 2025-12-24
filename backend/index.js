import express, { urlencoded } from 'express';
import body_parser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import dotenv from 'dotenv';


dotenv.config({ path: './src/env/.env' });

import './src/database/conexion.js';

/* Rutas */
import routeUsers from './src/routes/ruta.usuarios.js';
import routeProducts from './src/routes/ruta.productos.js';
import routeClientes from './src/routes/ruta.clientes.js';
import routeVentas from './src/routes/ruta.ventas.js';
import routeCostos from './src/routes/ruta.costos.js';
import routeLotes from './src/routes/ruta.lotes.js';
import routePerdidas from './src/routes/ruta.perdidas.js';
import routeReportesLote from './src/routes/ruta.reportes.lote.js';
import routeTipoNegocio from './src/routes/ruta.tipo.negocio.js';
import authRouter from './src/routes/ruta.auth.js';

const server = express();


server.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false
}));


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, // límite de 100 peticiones por ventana
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit más estricto para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Solo 5 intentos de login
    message: 'Demasiados intentos de inicio de sesión, intenta de nuevo más tarde',
    skipSuccessfulRequests: true
});

// 3. HPP - Prevenir HTTP Parameter Pollution
server.use(hpp());

// 4. CORS configurado correctamente
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:19006', 
    'http://192.168.1.100:19006',
    
];

server.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));



server.use(body_parser.json({ limit: '10mb' }));
server.use(body_parser.urlencoded({ extended: false, limit: '10mb' }));

// Aplicar rate limiter general
server.use(limiter);

// ================== RUTAS ==================

/* Rutas públicas */
server.use('/auth', loginLimiter, authRouter);

/* Rutas protegidas - Requieren autenticación */
server.use('/usuario', routeUsers);
server.use('/producto', routeProducts);
server.use('/cliente', routeClientes);
server.use('/ventas', routeVentas);
server.use('/costos', routeCostos);
server.use('/lote', routeLotes);
server.use('/perdida', routePerdidas);
server.use('/reporte-lote', routeReportesLote);
server.use('/negocio', routeTipoNegocio);

// ================== MANEJO DE ERRORES ==================

// Ruta no encontrada
server.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejador de errores global
server.use((err, req, res, next) => {
    console.error('Error:', err.message);
    
    if (err.message === 'No permitido por CORS') {
        return res.status(403).json({ message: 'Acceso no permitido' });
    }
    
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor'
    });
});

// ================== SERVIDOR ==================

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
    console.log(" Servidor corriendo en el puerto", port);
    console.log(" Seguridad activada: Helmet, Rate Limiting, CORS configurado");
});
