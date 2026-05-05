import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const Categoria = db.define('CATEGORIAS', {
    CATEGORIA_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    NOMBRE: {
        type: DataTypes.STRING(30),
        allowNull: false
    }
}, {
    timestamps: false
})

export default Categoria
