import express from 'express'
import { formularioLogin, autenticar, formularioRegistro, registrar, confirmar, formularioOlvidePassword, resetPassword, comprobarToken, nuevoPassword, cerrarSesion, perfil} from '../controllers/usuarioController.js'
import { verifyCsrfToken, regenerateCsrfToken } from '../middlewares/csrfMiddleware.js'
<<<<<<< HEAD
import {protegerRuta} from '../middlewares/protegerRuta.js';
=======
import protegerRuta from '../middlewares/protegerRuta.js';
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
const router = express.Router()
//Rounting
router.get('/login', formularioLogin)
router.post('/login', verifyCsrfToken, autenticar, regenerateCsrfToken)
router.get('/registro', formularioRegistro)
router.post('/registro', verifyCsrfToken, registrar, regenerateCsrfToken)
router.get('/confirmar/:token', confirmar)
router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', verifyCsrfToken, resetPassword, regenerateCsrfToken)
router.get('/perfil', protegerRuta, perfil)
//almacena el nuevo  password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token',verifyCsrfToken, nuevoPassword, regenerateCsrfToken)
router.post('/cerrar-sesion', verifyCsrfToken, cerrarSesion)
export default router