import express from 'express';
<<<<<<< HEAD
import { inicio} from '../controllers/appController.js';
import {protegerRuta} from '../middlewares/protegerRuta.js';
const router = express.Router();

router.get('/catalogo', protegerRuta, inicio);
=======
import { inicio, crearPedido } from '../controllers/appController.js';
import protegerRuta from '../middlewares/protegerRuta.js';
const router = express.Router();

router.get('/catalogo', protegerRuta, inicio);
router.get('/crearPedido', protegerRuta, crearPedido);

>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
export default router;