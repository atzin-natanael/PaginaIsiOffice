import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const clientes = db.define('CLIENTES_PAGWEB_ISI', {
    CLIENTE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    CLAVE_CLIENTE: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    NOMBRE: { 
    type: DataTypes.STRING,
    allowNull: false
    }
}, {
    timestamps: false
})

export default clientes
