import bcrypt from 'bcrypt'
const usuarios=[
    {
        NOMBRE: 'Atzin',
        EMAIL: 'atzin_pacheco@live.com',
        confirmado: 1,
        CLIENTE_ID: 99999,
        password: bcrypt.hashSync('password', 10),
    }
]
export default usuarios