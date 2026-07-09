import express from 'express';
import { mostrarPedidos, pedidoCrear, verPedido } from '../controllers/appController.js';
import {protegerRuta, protegerRutaCliente} from '../middlewares/protegerRuta.js'
import protegerApi from '../middlewares/protegerApi.js'
import { verifyCsrfToken, regenerateCsrfToken } from '../middlewares/csrfMiddleware.js'
const router = express.Router()

router.post('/crear/:id', protegerRuta, verifyCsrfToken, pedidoCrear)
router.get('/mostrar/:id', protegerRuta, protegerRutaCliente, verifyCsrfToken, mostrarPedidos)
router.get('/ver/:id', protegerRuta, verPedido)
export default router