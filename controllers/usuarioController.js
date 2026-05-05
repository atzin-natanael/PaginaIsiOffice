import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import {generarId, generarJWT} from '../helpers/tokens.js'
import {emailRegistro, emailOlvidePassword} from '../helpers/emails.js'
import {regenerateCsrfToken} from '../middlewares/csrfMiddleware.js'
<<<<<<< HEAD
import Clientes from '../models/Clientes.js'
=======
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403

const formularioLogin = (req, res)=>{
    res.render('auth/login',{
        pagina: 'Iniciar Sesión',
        barra: true
    })
}
const autenticar = async (req, res) =>{
    await check('email').isEmail().withMessage('El Email es Obligatorio').run(req)
    await check('password').isLength({min: 6}).withMessage('La contraseña es Obligatoria').run(req)
    let resultado = validationResult(req)
    //verificar el resultado
    if(!resultado.isEmpty()){
       //errores
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
<<<<<<< HEAD
            barra: true,
=======
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
            errores: resultado.array()
        })
    }
    //Comprobar si el usuario existe
    const {email, password} = req.body
    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
         return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
<<<<<<< HEAD
            barra: true,
=======
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
            errores: [{msg: 'El Usuario no Existe'}]
        })
    }
    //Comprobar si el user esta confirmado
    if(!usuario.confirmado){
         return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
<<<<<<< HEAD
            barra: true,
=======
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
            errores: [{msg: 'El Usuario no está confirmado'}]
        })
    }
    //Revisar pw
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
<<<<<<< HEAD
            barra: true,
=======
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
            errores: [{msg: 'La contraseña es incorrecta'}]
        })
    }
    //autenticar el usuario
<<<<<<< HEAD
    const token =generarJWT({id: usuario.id, nombre: usuario.NOMBRE})
=======
    const token =generarJWT({id: usuario.id, nombre: usuario.nombre})
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
    //almacenar en cookie
    return res.cookie('_token', token, {
        httpOnly: true
        //secure: true,
        //sameSite: true
    }).redirect('/catalogo')

}
const formularioRegistro = (req, res)=>{
    res.render('auth/registro',{
<<<<<<< HEAD
        pagina: 'Crear Cuenta',
        barra: true
=======
        pagina: 'Crear Cuenta'
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
    })
}
const registrar = async(req, res)=>{
    //validacion
    await check('nombre').notEmpty().withMessage('El Nombre es obligatorio').run(req)
    await check('clave').notEmpty().withMessage('La Clave es obligatoria').run(req)
    await check('email').isEmail().withMessage('Eso no parece un Email').run(req)
    await check('password').isLength({min: 6}).withMessage('La contraseña debe tener al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Las contraseñas no son iguales').run(req)

    let resultado = validationResult(req)
    //verificar el resultado
    if(!resultado.isEmpty()){
       //errores
        return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            usuario: {
<<<<<<< HEAD
                NOMBRE: req.body.nombre,
                EMAIL: req.body.email,
                CLIENTE_ID: req.body.clave
=======
                nombre: req.body.nombre,
                email: req.body.email,
                clave: req.body.clave
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
            }
        })
    }
    //Verificar duplicados
    const {nombre, email, password, clave} = req.body
    const existeUsuario = await Usuario.findOne({where: {email}})
    if(existeUsuario){
         return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            errores: [{msg: 'El Usuario ya está registrado'}],
            usuario: {
<<<<<<< HEAD
                NOMBRE: req.body.nombre,
                EMAIL: req.body.email,
                CLIENTE_ID: req.body.clave
=======
                nombre: req.body.nombre,
                email: req.body.email,
                clave: req.body.clave
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
            }
        })
    }
    //Almacenar usuario
    const usuario = await Usuario.create({
<<<<<<< HEAD
        NOMBRE: nombre,
        EMAIL: email,
        password,
        CLIENTE_ID: clave,
=======
        nombre,
        email,
        password,
        clave,
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
        token: generarId()
    })
    //Envia email de confirmacion
    emailRegistro({
<<<<<<< HEAD
        nombre: usuario.NOMBRE,
        email: usuario.EMAIL,
=======
        nombre: usuario.nombre,
        email: usuario.email,
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
        token: usuario.token
    })
    //Mostrando al cliente la confirmacion
    res.render('templates/mensaje',{
        pagina: 'Cuenta Creada correctamente',
        mensaje: 'Hemos Enviado un Email de Confirmación, presiona en el enlace para confirmar'
    })
}
//Funcion que comprueba una cuenta
const confirmar = async (req, res)=>{
    const {token} = req.params;
    //Verificar si el token es valido
    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }
    //Confirmar la cuenta
    usuario.token =null
    usuario.confirmado = true
    await usuario.save()

    res.render('auth/confirmar-cuenta',{
            pagina: 'Cuenta Confirmada',
            mensaje: 'La Cuenta Se Confirmo Correctamente'
        })
}
const formularioOlvidePassword = (req, res)=>{
    res.render('auth/olvide-password',{
        pagina: 'Recuperar Contraseña'
    })
}
const resetPassword = async(req,res) =>{
     //validacion
    await check('email').isEmail().withMessage('Eso no parece un Email').run(req)

    let resultado = validationResult(req)
    //verificar el resultado
    if(!resultado.isEmpty()){
       //errores
        return res.render('auth/olvide-password',{
        pagina: 'Recuperar Contraseña',
        errores: resultado.array()
    })
    }
    const {email} = req.body
    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
        return res.render('auth/olvide-password',{
        pagina: 'Recuperar Contraseña',
        errores: [{msg: 'El email no pertenece a ningun usuario'}]
    })
    }
    //generar token
    usuario.token = generarId()
    await usuario.save()
    //enviar email
    emailOlvidePassword({
<<<<<<< HEAD
        email: usuario.EMAIL,
        nombre: usuario.NOMBRE,
=======
        email: usuario.email,
        nombre: usuario.nombre,
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
        token: usuario.token
    })
    //renderizar un mensaje
        return res.render('templates/mensaje',{
            pagina: 'Reestablece tu contraseña',
            mensaje: 'Hemos enviado un email con las instrucciones'
        })

}
const comprobarToken = async(req, res)=>{
    const {token} = req.params
    const usuario = await Usuario.findOne({where:{token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Reestablece tu Contraseña',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }
    //Mostrar formulario para modificar pw
    return res.render('auth/reset-password',{
        pagina: 'Restablece tu Contraseña'
    })
}
const nuevoPassword = async(req, res)=>{
    //Valida password
    await check('password').isLength({min: 6}).withMessage('La contraseña debe tener al menos 6 caracteres').run(req)
    let resultado = validationResult(req)
    //verificar el resultado
    if(!resultado.isEmpty()){
       //errores
        return res.render('auth/reset-password',{
            pagina: 'Restablece tu Contraseña',
            errores: resultado.array()
        })
    }
    //identificar usuario
    const {token} = req.params
    const {password} = req.body
    //identificar quien hace el cambio
    const usuario = await Usuario.findOne({where: {token}})

    //hashear pw
    const salt= await bcrypt.genSalt(10)
    usuario.password = await  bcrypt.hash(password, salt)    
    usuario.token=null
    await usuario.save()
    
    return res.render('auth/confirmar-cuenta',{
    pagina: 'Contraseña Reestablecida',
    mensaje: 'La Contraseña se reestableció Correctamente'
    })
}
const cerrarSesion= (req,res)=>{
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}
<<<<<<< HEAD
const perfil = async (req, res) => {
    const cliente = await Clientes.findOne({
        where: {CLIENTE_ID: req.usuario.CLIENTE_ID}
    });
    res.render('auth/perfil', {
        pagina: 'Mi Perfil',
        usuario: req.usuario,
        cliente
=======
const perfil = (req, res) => {
    res.render('auth/perfil', {
        pagina: 'Mi Perfil',
        usuario: req.usuario
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
    })
}


export{
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,  
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    cerrarSesion,
    perfil
}