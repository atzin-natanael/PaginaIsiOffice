import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const DescuentosClientes = db.define('DESCUENTOS_CLIENTES', {
    DESCUENTO_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    CLIENTE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    DESCUENTO: {
        type: DataTypes.DECIMAL(4,2),
        allowNull: false,
        defaultValue: 30.00,
         validate: {
            min: 0,
            max: 50}
    }
}, {
    timestamps: false
})

export default DescuentosClientes