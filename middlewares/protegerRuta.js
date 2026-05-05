import jwt from 'jsonwebtoken'
import {Usuario} from '../models/index.js'
const protegerRuta =async(req, res, next)=>{
    //Verificar si hay token
    const {_token} = req.cookies
    console.log('Token en protegerRuta:', _token);
    if(!_token){
        return res.redirect('/auth/login')
    }
    //Comprobar el token
    try{
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)
        //almacenar usuario al request
        console.log('Usuario encontrado en protegerRuta:', usuario);
        if(usuario){
            req.usuario = usuario
            res.locals.usuario = usuario
        }else{
            return res.redirect('/auth/login')
        }
        return next()
    }catch(error){
        console.error('JWT inválido:', error.message)
        return res.redirect('/auth/login')
        // ❌ NO borres la cookie aquí todavía
    }
}
const protegerRutaCliente =async(req, res, next)=>{
    //Verificar si hay token
    const {_token} = req.cookies
    const {id} = req.params
    console.log('parametros en protegerRutaCliente:', req.params);
    console.log('Token en protegerRuta:', _token);
    if(!_token){
        return res.redirect('/auth/login')
    }
    //Comprobar el token
    try{
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)
        //almacenar usuario al request
        console.log('Usuario encontrado en protegerRuta:', usuario);
        if(usuario){
            req.usuario = usuario
            res.locals.usuario = usuario
            if(usuario.CLIENTE_ID !== parseInt(id)){
                return res.redirect('/auth/login')
            }
        }else{
            return res.redirect('/auth/login')
        }
        return next()
    }catch(error){
        console.error('JWT inválido:', error.message)
        return res.redirect('/auth/login')
        // ❌ NO borres la cookie aquí todavía
    }
}
export {protegerRuta, protegerRutaCliente}