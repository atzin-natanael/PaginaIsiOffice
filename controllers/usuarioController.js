import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import {generarId, generarJWT} from '../helpers/tokens.js'
import {emailRegistro, emailOlvidePassword} from '../helpers/emails.js'
import {regenerateCsrfToken} from '../middlewares/csrfMiddleware.js'
import Clientes from '../models/Clientes.js'

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
            barra: true,
            errores: resultado.array()
        })
    }
    //Comprobar si el usuario existe
    const {email, password} = req.body
    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
         return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            barra: true,
            errores: [{msg: 'El Usuario no Existe'}]
        })
    }
    //Comprobar si el user esta confirmado
    if(!usuario.confirmado){
         return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            barra: true,
            errores: [{msg: 'El Usuario no está confirmado'}]
        })
    }
    //Revisar pw
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            barra: true,
            errores: [{msg: 'La contraseña es incorrecta'}]
        })
    }
    //autenticar el usuario
    const token =generarJWT({id: usuario.id, nombre: usuario.NOMBRE})
    //almacenar en cookie
    return res.cookie('_token', token, {
        httpOnly: true
        //secure: true,
        //sameSite: true
    }).redirect('/catalogo')

}
const formularioRegistro = (req, res)=>{
    res.render('auth/registro',{
        pagina: 'Crear Cuenta',
        barra: true
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
                NOMBRE: req.body.nombre,
                EMAIL: req.body.email,
                CLIENTE_ID: req.body.clave
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
                NOMBRE: req.body.nombre,
                EMAIL: req.body.email,
                CLIENTE_ID: req.body.clave
            }
        })
    }
    let CLIENTE_ID_OBT = "";
    try{
        console.log('API URL:',     process.env.API_URL);
        console.log('Clave del cliente:', clave);
        const response = await fetch(`${process.env.API_URL}/cliente/${clave}`);
        if (!response.ok) {
            return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            errores: [{msg: 'Error en la clave del cliente, no se pudo verificar'}],
            usuario: {
                NOMBRE: req.body.nombre,
                EMAIL: req.body.email,
                CLIENTE_ID: req.body.clave
            }
        })
        }
        const data = await response.json();
        console.log('Datos obtenidos de la API:', data);
        CLIENTE_ID_OBT = data[0].CLIENTE_ID;   
        console.log('CLIENTE_ID obtenido:', CLIENTE_ID_OBT);
    }
    catch(error){
        console.log('Error al obtener datos del cliente desde la API');
        console.log(error)
    }
    console.log('CLIENTE_ID final:', CLIENTE_ID_OBT);
    //Almacenar usuario
    const usuario = await Usuario.create({
        NOMBRE: nombre,
        EMAIL: email,
        password,
        CLIENTE_ID: CLIENTE_ID_OBT, 
        token: generarId()
    })
    //Envia email de confirmacion
    emailRegistro({
        nombre: usuario.NOMBRE,
        email: usuario.EMAIL,
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
        email: usuario.EMAIL,
        nombre: usuario.NOMBRE,
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
const perfil = async (req, res) => {
    const cliente = await Clientes.findOne({
        where: {CLIENTE_ID: req.usuario.CLIENTE_ID}
    });
    res.render('auth/perfil', {
        pagina: 'Mi Perfil',
        usuario: req.usuario,
        cliente
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