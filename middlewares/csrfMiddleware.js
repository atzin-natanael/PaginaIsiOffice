import crypto from 'crypto-browserify'
const generarCsrfToken = ()=> {
    return crypto.randomBytes(24).toString('hex')
}
const csrfMiddleware = (req, res, next) =>{
    if(!req.cookies.csrfToken){
        const csrfToken = generarCsrfToken()
        res.cookie('csrfToken', csrfToken, {
            httpOnly: true,
            secure: true, // Forzar a true si ya usas https en el subdominio de pedidos
            sameSite: 'Lax', // Cambia de strict a Lax para facilitar la comunicación entre subdominios
            maxAge: 3600000 
        });
        req.csrfToken = csrfToken
    }
    else{
        req.csrfToken = req.cookies.csrfToken
    }
    res.locals.csrfToken = req.csrfToken
    next()
}
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

const regenerateCsrfToken = (req, res, next)=>{
    if(!['POST','PUT','DELETE', 'PATCH'].includes(req.method)){
        return next()
    }
    const newCsrfToken = generarCsrfToken()
    res.cookie('csrfToken', csrfToken, {
        httpOnly: true,
        secure: true, // Forzar a true si ya usas https en el subdominio de pedidos
        sameSite: 'Lax', // Cambia de strict a Lax para facilitar la comunicación entre subdominios
        maxAge: 3600000 
    });
    req.csrfToken = newCsrfToken
    res.locals.csrfToken = newCsrfToken
    next()
}
export{
    csrfMiddleware, verifyCsrfToken, regenerateCsrfToken
}