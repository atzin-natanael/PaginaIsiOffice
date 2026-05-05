import bcrypt from 'bcrypt'
const usuarios=[
    {
<<<<<<< HEAD
        NOMBRE: 'Atzin',
        EMAIL: 'atzin_pacheco@live.com',
        confirmado: 1,
        CLIENTE_ID: 99999,
        password: bcrypt.hashSync('password', 10),
=======
        nombre: 'Atzin',
        email: 'atzin_pacheco@live.com',
        confirmado: 1,
        clave: 100000,
        password: bcrypt.hashSync('password', 10),

>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
    }
]
export default usuarios