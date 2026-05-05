import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const Lineas = db.define('LINEAS', {
    LINEA_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    NOMBRE: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    timestamps: false
})

export default Lineas
