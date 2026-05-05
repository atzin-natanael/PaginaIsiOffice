import nodemailer from 'nodemailer'

const emailRegistro = async (datos) =>{
    // Looking to send emails in production? Check out our Email API/SMTP product!
const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
});
    const {email, nombre, token} = datos
    await transport.sendMail({
        from: '"IsiOffice" <no-reply@papeleriacornejo.com>',
        to: email,
        subject: 'Confirma tu cuenta en IsiOffice.com',
        text: 'Confirma tu cuenta en IsiOffice.com',
        html: `
            <p>Hola ${nombre}, Comprueba tu cuenta en IsiOffice.com</p>
            <p>Tu cuenta ya esta lista, solo debes confirmarlo en el siguiente enlace:
            <a href= ${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}>Confirmar Cuenta</a> </p>
            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}
const emailOlvidePassword = async (datos) =>{
    // Looking to send emails in production? Check out our Email API/SMTP product!
const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
});
    const {email, nombre, token} = datos
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Restablece tu Contraseña en BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, Has solicitado reestableber tu contraseña en BienesRaices.com</p>
            <p>Sigue el siguiente enlace para reestablecer la contraseña:
            <a href= ${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}>Reestablecer Contraseña</a> </p>
            <p>Si tu no solicitaste el cambio de contraseña, puedes ignorar el mensaje</p>
        `
    })
}
export{
    emailRegistro,
    emailOlvidePassword
}