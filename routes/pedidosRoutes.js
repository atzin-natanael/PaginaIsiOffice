import express from 'express';
import { mostrarPedidos, pedidoCrear } from '../controllers/appController.js';
import {protegerRuta, protegerRutaCliente} from '../middlewares/protegerRuta.js'
import protegerApi from '../middlewares/protegerApi.js'
import { verifyCsrfToken, regenerateCsrfToken } from '../middlewares/csrfMiddleware.js'
const router = express.Router()

router.post('/crear/:id', protegerRuta, verifyCsrfToken, pedidoCrear)
router.get('/mostrar/:id', protegerRuta, protegerRutaCliente, verifyCsrfToken, mostrarPedidos)
export default router