import {DataTypes} from 'sequelize'
import bcrypt from 'bcrypt'
import db from '../config/db.js'

const Usuario = db.define('USUARIOS',{
<<<<<<< HEAD
    NOMBRE: {
        type: DataTypes.STRING,
        allowNull: false
    },
    EMAIL: {
        type: DataTypes.STRING,
        allowNull: false
    },
    CLIENTE_ID: {
        type: DataTypes.INTEGER,
=======
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    clave: {
        type: DataTypes.STRING,
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN
}, {
    hooks: {
        beforeCreate: async function(usuario){
                const salt= await bcrypt.genSalt(10)
            usuario.password = await  bcrypt.hash(usuario.password, salt)       
        }
    },
        scopes: {
        eliminarPassword: {
            attributes: { exclude: ['password'] }
        }
    }
})
//Metodo personalizado
Usuario.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password, this.password)
}
export default Usuario