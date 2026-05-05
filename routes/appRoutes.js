import express from 'express';
import { inicio} from '../controllers/appController.js';
import {protegerRuta} from '../middlewares/protegerRuta.js';
const router = express.Router();

router.get('/catalogo', protegerRuta, inicio);
export default router;