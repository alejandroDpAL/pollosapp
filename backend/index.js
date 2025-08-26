import express, { urlencoded } from 'express'; 
import body_parser from 'body-parser';
import cors from 'cors';

import './src/database/conexion.js';

/* Rutas */
import routeUsers from './src/rutas/ruta.usuarios.js';
import routeProducts from './src/rutas/ruta.productos.js';
import routeClientes from './src/rutas/ruta.clientes.js';
import routeVentas from './src/rutas/ruta.ventas.js';
import routeCostos from './src/rutas/ruta.costos.js';
import routeLotes from './src/rutas/ruta.lotes.js';
import routePerdidas from './src/rutas/ruta.perdidas.js';
import routeReportesLote from './src/rutas/ruta.reportes.lote.js';
import routeTipoNegocio from './src/rutas/ruta.tipo.negocio.js';

const server = express();

server.use(body_parser.json());
server.use(body_parser.urlencoded({ extended: false }));
server.use(cors());

/* rutas  */
server.use('/usuario', routeUsers);
server.use('/producto', routeProducts);
server.use('/cliente', routeClientes);
server.use('/ventas', routeVentas);
server.use('/costos', routeCostos);
server.use('/lote', routeLotes);
server.use('/perdida', routePerdidas);
server.use('/reporte-lote', routeReportesLote);
server.use('/negocio', routeTipoNegocio);

const port = 3000;
server.listen(port, '0.0.0.0', () => {
    console.log("✅ Servidor corriendo en el puerto", port);
});
