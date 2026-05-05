const errorHandler = (err, req, res, next) =>{
    const statusCode = err.status || 500
    const defaultMessage = {
        400: 'Resource not Found',
        403: 'Access Prohibed',
        500: 'Internal Server Error'
    }
    const message = err.message || defaultMessage[statusCode] || 'An unexpected error'
    res.status(statusCode).render('error/error',{
        title: `Error: ${statusCode}`,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    })
}
const notFound = (req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
}
export{
    errorHandler,
    notFound
}
