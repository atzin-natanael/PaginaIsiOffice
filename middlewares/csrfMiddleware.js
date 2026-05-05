import crypto from 'crypto-browserify'
const generarCsrfToken = ()=> {
    return crypto.randomBytes(24).toString('hex')
}
const csrfMiddleware = (req, res, next) =>{
    if(!req.cookies.csrfToken){
        const csrfToken = generarCsrfToken()
        res.cookie('csrfToken', csrfToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // una hora
        })
        req.csrfToken = csrfToken
    }
    else{
        req.csrfToken = req.cookies.csrfToken
    }
    res.locals.csrfToken = req.csrfToken
    next()
}
<<<<<<< HEAD
const verifyCsrfToken = (req, res, next) => {

    if (!['POST','PUT','DELETE','PATCH'].includes(req.method)) {
        return next();
    }

    const csrfTokenFromCookie = req.cookies?.csrfToken;
    const tokenEntrante = req.body?._csrf || req.get('X-CSRF-Token');

    if (!csrfTokenFromCookie || csrfTokenFromCookie !== tokenEntrante) {

        // Si no hay sesión activa → login
        if (!req.session || !req.session.usuario) {
            return res.redirect('/auth/login');
        }

        // Si hay sesión pero token inválido → recargar con mensaje
        req.session.mensajeError = 'Tu sesión expiró por inactividad. Intenta nuevamente.';
        return res.redirect(req.get('Referer') || '/');
    }

    next();
};

=======
const verifyCsrfToken = (req, res, next)=>{
    if(!['POST','PUT','DELETE', 'PATCH'].includes(req.method)){
        return next()
    }
    const csrfTokenFromCookie = req.cookies.csrfToken
    const csrfTokenFromBody = req.body._csrf
    console.log(req.method)
    console.log(req.body)
    console.log('CSRF Body:', req.body?._csrf)
    if(csrfTokenFromCookie !== csrfTokenFromBody){
        const err = new Error('Error Desconocido, Intentar de nuevo')
        err.status = 403
        return next(err)
    }
    next()
}
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
const regenerateCsrfToken = (req, res, next)=>{
    if(!['POST','PUT','DELETE', 'PATCH'].includes(req.method)){
        return next()
    }
    const newCsrfToken = generarCsrfToken()
    res.cookie('csrfToken', newCsrfToken,{
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000 // una hora
    })
    req.csrfToken = newCsrfToken
    res.locals.csrfToken = newCsrfToken
    next()
}
export{
    csrfMiddleware, verifyCsrfToken, regenerateCsrfToken
}