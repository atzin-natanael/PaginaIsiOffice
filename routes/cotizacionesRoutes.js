import express from 'express'
import {body} from 'express-validator'
import {
  crearCotizacion,
  agregarArticuloACotizacion,
  vaciarCarritoSesion,
  mostrarCotizaciones,
  editarCotizaciones,
  eliminarArticuloSesion,
  editarArticuloCotizacion,
  eliminarArticuloSesionEditar,
  guardarCotizacionCompleta,
  cancelarCotizacion,
  eliminarArticuloSesionEdit,
  guardarCotizacionEditando,
  verCotizacion,
  enviarPdf,
  datosCotizacion
} from '../controllers/appController.js'
import {protegerRuta, protegerRutaCliente} from '../middlewares/protegerRuta.js'
import protegerApi from '../middlewares/protegerApi.js'
import { verifyCsrfToken, regenerateCsrfToken } from '../middlewares/csrfMiddleware.js'
import e from 'express'
const router = express.Router()

router.get('/crear', protegerRuta, crearCotizacion)
router.post('/agregar', protegerRuta, verifyCsrfToken, agregarArticuloACotizacion)
//router.post('/agregarEditando', protegerRuta, verifyCsrfToken, agregarEditandoArticuloACotizacion)
router.post('/editar/:id/agregar', protegerRuta, verifyCsrfToken, editarArticuloCotizacion)
router.get('/vaciar-carrito', vaciarCarritoSesion)
router.get('/mostrar/:id', protegerRuta, protegerRutaCliente, verifyCsrfToken, mostrarCotizaciones)
router.get('/editar/:id', protegerRuta, editarCotizaciones)
router.get('/enviar/:id', protegerRuta, enviarPdf)
router.post('/datos/:id', protegerRuta,
  body('metodoPago').notEmpty().withMessage('El método de pago es obligatorio'),
  body('formaPago').notEmpty().withMessage('La forma de pago es obligatoria'),
  body('usoCFDI').notEmpty().withMessage('El uso de CFDI es obligatorio'),
  datosCotizacion)
router.get('/ver/:id', protegerRuta, verCotizacion)
router.post('/editar/eliminar-producto', verifyCsrfToken, eliminarArticuloSesionEditar)
router.post('/eliminar-producto', verifyCsrfToken, eliminarArticuloSesion)
router.post('/eliminar-producto-edit', verifyCsrfToken, eliminarArticuloSesionEdit)
//router.get('/exito', protegerRuta, verifyCsrfToken, extito);
router.post('/cancelar/:id', protegerRuta, verifyCsrfToken, cancelarCotizacion)
router.post('/guardar', protegerRuta, verifyCsrfToken, guardarCotizacionCompleta)
router.post('/guardar-edit', protegerRuta, verifyCsrfToken, guardarCotizacionEditando)

// cotizacionesRoutes.js
// Cambiamos protegerApi por verifyCsrfToken para que coincida con lo que envías
export default router
