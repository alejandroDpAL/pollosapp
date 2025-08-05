import express, { urlencoded } from 'express';
import body_parser from 'body-parser';
import routeUsers from './src/rutas/ruta.usuarios.js';
import routeProducts from './src/rutas/ruta.productos.js';
import routeClientes from './src/rutas/ruta.clientes.js';
import routeVentas from './src/rutas/ruta.ventas.js';
import cors from 'cors'

import './src/database/conexion.js'

const server = express()
server.use(body_parser.json())
server.use(body_parser.urlencoded({extended : false}))
server.use(cors())

/* rutas  */
server.use('/usuario',routeUsers)
server.use('/producto',routeProducts)
server.use('/cliente',routeClientes)
server.use('/ventas',routeVentas)


const port = 3000
server.listen(port, '0.0.0.0', () => {
    console.log("el servidor esta funcionando en el puerto ", port);
    
})
