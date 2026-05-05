import express from 'express'
<<<<<<< HEAD
import session from 'express-session'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import appRoutes from './routes/appRoutes.js'
import cotizacionRoutes from './routes/cotizacionesRoutes.js'
import pedidosRoutes from './routes/pedidosRoutes.js'
=======
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import appRoutes from './routes/appRoutes.js'
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
import db from './config/db.js'
import { csrfMiddleware, verifyCsrfToken } from './middlewares/csrfMiddleware.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'
import helmet from 'helmet'
<<<<<<< HEAD
import cors from 'cors'
=======
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
//Crear la app
const app = express()
//Habilitar Pug (view engine)
//Habilita la lectura de datos de formulario
app.use(express.urlencoded({extended: true}))
<<<<<<< HEAD
app.use(express.json())
=======

>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
app.use(cookieParser())

//Conexion DB
try{
    await db.authenticate()
    db.sync()
    console.log('Conexion correcta a la db')
}catch(error){
    console.log(error)
}
<<<<<<< HEAD
// En el servidor del puerto 3000
app.use(cors({
    origin: 'http://localhost:3001', // El origen exacto de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Agregamos OPTIONS por el preflight
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization'], // Agregamos tu header de seguridad
    credentials: true // Para que permita el intercambio de cookies si fuera necesario
}));
// 🔑 SESIONES (AQUÍ VA)
app.use(session({
  secret: 'isi-cotizacion',
  resave: false,
  saveUninitialized: true
}))
//csrf middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "http://localhost:3000" // 👈 TU API
        ],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    }
  })
);

=======

//csrf middleware
app.use(helmet())
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
app.use(csrfMiddleware)
app.use(verifyCsrfToken)

app.set('view engine', 'pug')
app.set('views', './views')
//CarpetaPublica
app.use(express.static('public'))
//Routing
app.use('/', appRoutes)
<<<<<<< HEAD
app.use('/cotizacion', cotizacionRoutes)
app.use('/pedido', pedidosRoutes)
app.use('/auth',usuarioRoutes)
// Redireccionar la raíz al catálogo
app.get('/', (req, res) => {
    res.redirect('/catalogo');
});
=======
app.use('/auth',usuarioRoutes)

>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403

app.use(notFound)
app.use(errorHandler)

//Definir un  puerto
const port = process.env.PORT || 3001
app.listen(port, () =>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
});